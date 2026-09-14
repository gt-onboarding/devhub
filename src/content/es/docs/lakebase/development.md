---
title: Desarrollo con Lakebase Postgres
sidebar_label: Desarrollo
sourceOfTruth:
  skills:
    - databricks-lakebase
    - databricks-dabs
  docs:
    - /docs/appkit/v0/plugins/lakebase
    - https://docs.databricks.com/aws/en/oltp/
---

# Desarrollo con Lakebase Postgres \{#lakebase-postgres-development\}

Esta página cubre el desarrollo sobre Lakebase Postgres desde una app de AppKit. Para información sobre Lakebase en sí (proyectos, branches, autoscaling, conectividad), consulta la [documentación de Lakebase](https://docs.databricks.com/aws/en/oltp/) o la agent skill [`databricks-lakebase`](/docs/tools/ai-tools/agent-skills).

## API del plugin de AppKit \{#appkit-plugin-api\}

El plugin `lakebase()` proporciona un `pg.Pool` estándar con renovación automática del token OAuth. Una vez registrado, accede a él mediante `AppKit.lakebase`:

```typescript
import { createApp, lakebase, server } from "@databricks/appkit";

const AppKit = await createApp({
  plugins: [server(), lakebase()],
});

// Consulta parametrizada estándar
const { rows } = await AppKit.lakebase.query<{ id: number; name: string }>(
  "SELECT id, name FROM app.items WHERE active = $1",
  [true],
);

// Configuración lista para ORM (Drizzle, Prisma, TypeORM, etc.)
const ormConfig = AppKit.lakebase.getOrmConfig();
// Devuelve: { host, port, database, ssl, user, ... }

// Configuración compatible con pg
const pgConfig = AppKit.lakebase.getPgConfig();

// pg.Pool en bruto para usos avanzados
const pool = AppKit.lakebase.pool;
```


### Configuración del pool \{#pool-configuration\}

Sobrescribe los valores predeterminados del pool de conexiones pasando un objeto `pool`:

```typescript
lakebase({
  pool: {
    max: 10, // máximo de conexiones (predeterminado: 10)
    connectionTimeoutMillis: 5000, // tiempo de espera de conexión en ms (predeterminado: 10000)
    idleTimeoutMillis: 30000, // tiempo de espera por inactividad en ms (predeterminado: 30000)
  },
});
```

El valor predeterminado `max: 10` se aplica al pool compartido de la entidad de servicio. Los pools por usuario con delegación de identidad (creados mediante `asUser(req)`) usan `max: 3` de forma predeterminada.


### Integración con el almacenamiento en caché \{#caching-integration\}

Lakebase Postgres también actúa como backend del [plugin de caché de AppKit](/docs/appkit/v0/plugins/caching) cuando está en buen estado. Para conocer la API completa, la integración con el ORM y la configuración de la conexión, consulta la [referencia del plugin](/docs/appkit/v0/plugins/lakebase).

## Modelo de autenticación \{#auth-model\}

Lakebase Postgres autentica las conexiones a la base de datos mediante tokens OAuth o contraseñas nativas de Postgres. El método depende de dónde se ejecute tu aplicación.

**Aplicaciones desplegadas**: cuando lo añades como recurso a una Databricks App, Databricks crea automáticamente un service principal, le concede un rol de Postgres equivalente e inyecta los datos de conexión como variables de entorno. El plugin `lakebase()` de AppKit se encarga automáticamente de la renovación de los tokens OAuth.

**Desarrollo local**: tu identidad personal de Databricks se conecta con un token OAuth generado por `databricks postgres generate-database-credential`. Los tokens caducan al cabo de una hora, pero la caducidad solo se comprueba al iniciar sesión: las conexiones ya abiertas siguen activas aunque el token haya caducado. Ejecuta `databricks apps deploy` al menos una vez antes de ejecutar `npm run dev`. En [Configuración local](#local-setup) se explica por qué importa el orden y qué hacer si aparecen errores de permisos.

[Acerca de la autenticación](https://docs.databricks.com/aws/en/oltp/projects/authentication) trata la autenticación por contraseña de Postgres, la rotación de tokens y los flujos de máquina a máquina.

## Configuración local \{#local-setup\}

`databricks apps init` rellena el archivo `.env` con los valores de conexión correctos de Lakebase Postgres. Ejecuta `databricks apps deploy` antes de `npm run dev`. El despliegue configura una identidad administrada (el service principal de la aplicación) que crea el esquema `app` y sus tablas en el primer arranque y se convierte en su propietaria. Si, en cambio, ejecutas primero `npm run dev`, esos objetos se crearán con tus credenciales personales. En ese caso, la aplicación desplegada no podrá acceder a ellos y obtendrás el error `permission denied for schema app`.

### Acceso local a la base de datos \{#local-database-access\}

Si creaste el proyecto de Lakebase Postgres, tu identidad ya tiene el acceso necesario. Después de ejecutar `databricks apps deploy` una vez, `npm run dev` ya funciona.

Para los colaboradores que necesiten acceso local de lectura/escritura, otórgales un rol en la branch desde la interfaz de Lakebase (**Roles &amp; Databases**). La autenticación por contraseña de Postgres es una alternativa a OAuth: habilita las conexiones por contraseña, crea un rol con contraseña y luego usa esa contraseña como `PGPASSWORD` en `.env`. En [About authentication](https://docs.databricks.com/aws/en/oltp/projects/authentication) encontrarás los pasos para ambos casos.

También puedes generar una credencial de corta duración para usarla con cualquier cliente de PostgreSQL (DBeaver, pgAdmin, DataGrip o un driver de lenguaje):

```bash
databricks postgres generate-database-credential \
  projects/my-project/branches/production/endpoints/primary
```

La [documentación del plugin de AppKit: desarrollo local](/docs/appkit/v0/plugins/lakebase#local-development) describe alternativas de permisos granulares para equipos que necesitan acceso limitado a un esquema.


## Conectarse con psql \{#connect-with-psql\}

`databricks psql` abre una sesión interactiva de PostgreSQL sobre el endpoint de una branch. Requiere tener `psql` instalado localmente. Si no se indica un destino, te pide que elijas entre las bases de datos a las que tienes acceso.

```bash title="Common"
databricks psql --project my-project
```

```bash title="All Options"
databricks psql \
  --project $PROJECT_ID \
  --branch $BRANCH_ID \
  --endpoint $ENDPOINT_ID \
  --autoscaling \
  --max-retries 3 \
  --debug \
  -o json \
  --target $TARGET \
  --profile $DATABRICKS_PROFILE
```

<!-- cli-options:psql -->

| Opción            | Descripción                                                |
| ----------------- | ---------------------------------------------------------- |
| `--autoscaling`   | Mostrar solo proyectos de Lakebase Autoscaling             |
| `--project`       | ID del proyecto                                            |
| `--branch`        | ID de la branch (por defecto: selección automática)        |
| `--endpoint`      | ID del endpoint (por defecto: selección automática)        |
| `--max-retries`   | Reintentos de conexión; 0 para desactivar (por defecto, 3) |
| `--debug`         | activar el registro de depuración                          |
| `--output`, `-o`  | tipo de salida: text o json (por defecto, text)            |
| `--profile`, `-p` | perfil de ~/.databrickscfg                                 |
| `--target`, `-t`  | target del bundle que se usará (si corresponde)            |

<!-- /cli-options -->

Pasa argumentos adicionales directamente a `psql` tras un separador `--`; por ejemplo: `databricks psql --project my-project -- -c "SELECT 1"`.


## Feature branches \{#feature-branches\}

Usa las branches de Lakebase Postgres para aislar cambios de esquema y probar migraciones sin afectar a producción:

```bash title="Common"
databricks postgres create-branch projects/my-project feature-xyz \
  --json '{"spec": {"no_expiry": true}}'
```

```bash title="All Options"
databricks postgres create-branch \
  projects/$PROJECT_ID \
  $BRANCH_ID \
  --json '{"spec": {"source_branch": "projects/$PROJECT_ID/branches/$SOURCE_BRANCH_ID", "no_expiry": true}}' \
  --replace-existing \
  --debug \
  -o json \
  --target $TARGET \
  --no-wait \
  --timeout 10m \
  --profile $DATABRICKS_PROFILE
```

<!-- cli-options:postgres create-branch -->

| Opción               | Descripción                                                                                             |
| -------------------- | ------------------------------------------------------------------------------------------------------- |
| `--json`             | cadena JSON en línea o @ruta/al/archivo.json con el cuerpo de la solicitud (por defecto JSON (0 bytes)) |
| `--no-wait`          | no esperar a alcanzar el estado DONE                                                                    |
| `--replace-existing` | Si es true, actualiza la branch si ya existe en lugar de devolver un error.                             |
| `--timeout`          | tiempo máximo para alcanzar el estado DONE                                                              |
| `--debug`            | habilitar el registro de depuración                                                                     |
| `--output`, `-o`     | tipo de salida: text o json (por defecto text)                                                          |
| `--profile`, `-p`    | perfil de ~/.databrickscfg                                                                              |
| `--target`, `-t`     | target del bundle que se usará (si corresponde)                                                         |

<!-- /cli-options -->

Se crea automáticamente un endpoint `primary` de lectura y escritura, que hereda los `default_endpoint_settings` del proyecto. Las branches requieren una política de expiración (`ttl`, `expire_time` o `no_expiry: true`). En [Expiración de branches](https://docs.databricks.com/aws/en/oltp/projects/manage-branches#expiration) se detallan las políticas disponibles.

Elimínala cuando termines:

```bash title="Common"
databricks postgres delete-branch projects/my-project/branches/feature-xyz
```

```bash title="All Options"
databricks postgres delete-branch \
  projects/$PROJECT_ID/branches/$BRANCH_ID \
  --purge \
  --no-wait \
  --timeout 10m \
  --debug \
  -o json \
  --target $TARGET \
  --profile $DATABRICKS_PROFILE
```

<!-- cli-options:postgres delete-branch -->

| Opción            | Descripción                                                                                 |
| ----------------- | ------------------------------------------------------------------------------------------- |
| `--no-wait`       | no esperar a alcanzar el estado DONE                                                        |
| `--purge`         | Si es true, elimina la branch de forma permanente; si es false, la elimina de forma lógica. |
| `--timeout`       | tiempo máximo para alcanzar el estado DONE                                                  |
| `--debug`         | habilitar el registro de depuración                                                         |
| `--output`, `-o`  | tipo de salida: text o json (text por defecto)                                              |
| `--profile`, `-p` | perfil de ~/.databrickscfg                                                                  |
| `--target`, `-t`  | target del bundle que se usará (si corresponde)                                             |

<!-- /cli-options -->


## Aplicaciones fuera de la plataforma \{#off-platform-apps\}

En el caso de las aplicaciones alojadas fuera de Databricks (AWS, Vercel, Netlify y otras), la plataforma no inyecta los datos de conexión ni renueva automáticamente los tokens OAuth. La rotación de tokens es responsabilidad de la aplicación. En [Acerca de la autenticación de Lakebase](https://docs.databricks.com/aws/en/oltp/projects/authentication) se explican la rotación de tokens y los patrones de máquina a máquina. La plantilla [Lakebase Off-Platform](/templates/lakebase-off-platform) incluye una implementación completa con la configuración del entorno y la integración con Drizzle ORM.

Para aprovisionar y conectarte sin usar una plantilla, crea un proyecto, consulta su endpoint y su base de datos y, a continuación, conéctate:

```bash
databricks postgres create-project <project-id>
databricks postgres list-endpoints projects/<project-id>/branches/production -o json
databricks postgres list-databases projects/<project-id>/branches/production -o json
databricks psql --project <project-id>
```

`create-project` crea un proyecto con una branch `production` predeterminada, una base de datos `databricks_postgres` y un endpoint de lectura y escritura. Si no tienes `psql`, ejecuta `databricks postgres generate-database-credential <endpoint-path>` y usa el token devuelto como contraseña (el nombre de usuario es tu correo de Databricks) con cualquier cliente de PostgreSQL. Consulta la [documentación de Lakebase](https://docs.databricks.com/aws/en/oltp/) o la agent skill [`databricks-lakebase`](/docs/tools/ai-tools/agent-skills) para conocer el flujo completo y todas las flags.

Los valores que necesitas de la salida de `list-endpoints` y `list-databases`:

| Valor                                 | Ruta JSON                  | Se usa para                  |
| ------------------------------------- | -------------------------- | ---------------------------- |
| Host del endpoint                     | `status.hosts.host`        | `PGHOST`                     |
| Ruta del recurso del endpoint         | `name`                     | `LAKEBASE_ENDPOINT`          |
| Ruta del recurso de base de datos     | `name` (de list-databases) | `lakebase.postgres.database` |
| Nombre de la base de datos PostgreSQL | `status.postgres_database` | `PGDATABASE`                 |

## Operaciones de larga duración \{#long-running-operations\}

De forma predeterminada, los comandos de creación, actualización y eliminación se bloquean hasta completarse. Usa `--no-wait` para obtener una respuesta inmediata y consultar el estado periódicamente:

```bash
databricks postgres create-project my-project \
  --json '{"spec": {"display_name": "My Project"}}' \
  --no-wait

databricks postgres get-operation projects/my-project/operations/<operation-id>
```


## Declarative Automation Bundles \{#declarative-automation-bundles\}

Los Declarative Automation Bundles (DABs) te permiten definir la infraestructura de Lakebase Postgres como código en `databricks.yml`, versionada junto con tu aplicación. Un bundle especifica `postgres_projects`, `postgres_branches` y `postgres_endpoints` dentro de `resources`.

<details>
<summary>Ejemplo de <code>databricks.yml</code> con un proyecto, una branch de desarrollo y una réplica de solo lectura</summary>

```yaml
bundle:
  name: my-lakebase-app

resources:
  postgres_projects:
    my_app:
      project_id: "my-lakebase-app"
      display_name: "My Lakebase Postgres App"
      pg_version: 17
      history_retention_duration: "172800s"
      default_endpoint_settings:
        autoscaling_limit_min_cu: 0.5
        autoscaling_limit_max_cu: 1.0
        suspend_timeout_duration: "300s"
        pg_settings:
          log_min_duration_statement: "1000"

  postgres_branches:
    dev_branch:
      parent: ${resources.postgres_projects.my_app.id}
      branch_id: "dev"
      no_expiry: true
      is_protected: false

  postgres_endpoints:
    read_replica:
      parent: ${resources.postgres_branches.dev_branch.id}
      endpoint_id: "replica"
      endpoint_type: "ENDPOINT_TYPE_READ_ONLY"
      autoscaling_limit_min_cu: 0.5
      autoscaling_limit_max_cu: 0.5
```

</details>


### Validar e implementar \{#validate-and-deploy\}

```bash
databricks bundle validate
databricks bundle deploy
```

`bundle deploy` es idempotente. Crea recursos nuevos y actualiza los existentes para que coincidan con la configuración. A diferencia de Databricks Jobs o Apps, no existe un paso `bundle run`: los recursos de Lakebase Postgres quedan activos en cuanto se despliegan. La [documentación de Declarative Automation Bundles](https://docs.databricks.com/aws/en/dev-tools/bundles/) describe todas las opciones, y la agent skill [`databricks-dabs`](/docs/tools/ai-tools/agent-skills) permite crear y validar bundles.


## Máscaras de actualización \{#update-masks\}

Los comandos de actualización requieren una máscara de actualización que indique qué campos se modificarán. El payload de `--json` contiene los nuevos valores. Solo cambian los campos incluidos en la máscara.

```bash
databricks postgres update-branch \
  projects/my-project/branches/production \
  spec.is_protected \
  --json '{"spec": {"is_protected": true}}'
```

Para varios campos, usa una máscara de actualización separada por comas (por ejemplo, `spec.autoscaling_limit_min_cu,spec.autoscaling_limit_max_cu`).


## Solución de problemas \{#troubleshooting\}

Para problemas de configuración de Databricks Apps (recursos en `databricks.yml` y `app.yaml`), [Add a Lakebase resource to a Databricks app](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/lakebase) contiene la referencia de recursos y variables de entorno. Para problemas de conexión, incluidos la reactivación tras inactividad y el formato del endpoint, [Troubleshooting in Connect external apps](https://docs.databricks.com/aws/en/oltp/projects/external-apps-connect#troubleshooting) ofrece las soluciones.

- **`permission denied for schema app` (app desplegada)**: se ejecutó `npm run dev` antes de `databricks apps deploy`, por lo que el esquema pertenece a tus credenciales personales y el service principal de la app no puede acceder a él. _(La propiedad de un esquema de PostgreSQL está vinculada al rol que lo creó y los usuarios normales no pueden reasignarla.)_ Si tienes datos que conservar, expórtalos antes de eliminarlo (con `pg_dump` o copiando las tablas a un esquema temporal). Después elimina el esquema y vuelve a desplegar para que el SP lo recree al iniciarse: `databricks psql --project <project-id> -- -c "DROP SCHEMA IF EXISTS app CASCADE;"` y luego `databricks apps deploy`.
- **`permission denied for schema app` (desarrollo local, colaborador)**: solo quien crea el proyecto de Lakebase obtiene acceso `databricks_superuser` de forma automática. Para dar acceso local a un compañero de equipo, el creador debe añadir un rol para su identidad en el branch (**Roles & Databases** en la interfaz de Lakebase) o configurar la autenticación por contraseña de Postgres. Consulta [About authentication](https://docs.databricks.com/aws/en/oltp/projects/authentication) para ver los pasos.
- **`Unknown field path in update_mask: 'spec.suspend_timeout_duration'`**: usa `spec.suspension` como máscara de actualización para todos los cambios de suspensión a nivel de endpoint con `update-endpoint`. Para desactivar el escalado a cero, pasa `{"spec": {"no_suspension": true}}`. Para cambiar el tiempo de espera, pasa `{"spec": {"suspend_timeout_duration": "300s"}}`. No se admite establecer `no_suspension: false`.
- **Conexión rechazada tras un periodo de inactividad**: el autoscaling de Lakebase escala a cero cuando no hay actividad. La primera conexión tras la inactividad provoca la reactivación y puede tardar un poco más. Si tu biblioteca de conexión no reintenta automáticamente, añade un bucle de reintentos corto.

## Documentación de AppKit \{#appkit-docs\}

Accede a la referencia de la API de AppKit, la documentación de componentes y la de plugins desde la terminal:

```bash
npx @databricks/appkit docs                    # explorar el índice de la documentación
npx @databricks/appkit docs "lakebase"         # ver la documentación del plugin de Lakebase Postgres
```

O consulta la [referencia del plugin de Lakebase Postgres para AppKit](/docs/appkit/v0/plugins/lakebase) en este sitio.


## Qué hacer a continuación \{#where-to-next\}

Los [templates](/templates) abarcan los patrones más habituales de Lakebase Postgres. Explóralos para encontrar un punto de partida o cópialos en tu agente de programación para generar la estructura de una aplicación funcional.