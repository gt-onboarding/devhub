---
title: Configuración de Lakebase Postgres
sidebar_label: Configuración
sourceOfTruth:
  skills:
    - databricks-lakebase
  docs:
    - /docs/appkit/v0/plugins/lakebase
    - https://docs.databricks.com/aws/en/oltp/projects/manage-projects
---

# Configuración de Lakebase Postgres \{#lakebase-postgres-configuration\}

AppKit se conecta a Lakebase Postgres mediante un recurso `postgres` declarado en `databricks.yml` y la variable `LAKEBASE_ENDPOINT` definida en `app.yaml`.

Esta página explica la configuración en AppKit. Para obtener información sobre Lakebase en sí (proyectos, branches, autoscaling, escalado a cero), consulta la [documentación de Lakebase](https://docs.databricks.com/aws/en/oltp/) o la agent skill [`databricks-lakebase`](/docs/tools/ai-tools/agent-skills).

## Valores de conexión \{#connection-values\}

Databricks Apps inyecta la mayoría de los valores de conexión durante el arranque. `LAKEBASE_ENDPOINT` es la excepción: se declara en `app.yaml` mediante `valueFrom: postgres` y se resuelve en el arranque a partir del recurso `postgres`:

```yaml
env:
  - name: LAKEBASE_ENDPOINT
    valueFrom: postgres
```

| Variable            | Descripción                                                               | Origen                                                 |
| ------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------ |
| `LAKEBASE_ENDPOINT` | Ruta del recurso del endpoint (`projects/.../branches/.../endpoints/...`) | Se define mediante `valueFrom: postgres` en `app.yaml` |
| `PGHOST`            | Host de Lakebase Postgres                                                 | Inyectada automáticamente por la plataforma            |
| `PGDATABASE`        | Nombre de la base de datos PostgreSQL                                     | Inyectada automáticamente por la plataforma            |
| `PGSSLMODE`         | Modo TLS (`require`)                                                      | Inyectada automáticamente por la plataforma            |
| `PGPORT`            | Puerto (5432)                                                             | Inyectada automáticamente por la plataforma            |

En el desarrollo local, estos valores provienen de tu archivo `.env`. En [Configuración local](/docs/lakebase/development#local-setup) se explica cómo completarlos.


## Manifiesto de plugins \{#plugin-manifest\}

Cuando registras el plugin `lakebase()` en `createApp`, AppKit genera `appkit.plugins.json`, que declara los recursos que necesita el plugin. Ejecuta `npx @databricks/appkit plugin sync --write` para regenerarlo después de añadir o modificar plugins:

```bash
npx @databricks/appkit plugin sync --write
```

Esto se ejecuta automáticamente durante `npm run dev` y `npm run build`. Haz commit del archivo junto con tu código.

La referencia de [configuración de AppKit](/docs/appkit/v0/configuration) detalla los bindings de recursos de plugins en `app.yaml`.


## Jerarquía de recursos \{#resource-hierarchy\}

Lakebase Postgres organiza los recursos en **proyectos** que contienen **branches**, y cada branch contiene **computes** y **bases de datos**.

```text
projects/{project_id}
  └── branches/{branch_id}
        ├── endpoints/{endpoint_id}   (compute)
        └── databases/{database_id}
```

* **Project**: contenedor de nivel superior. Se crea con `databricks postgres create-project`.
* **Branch**: entorno de base de datos aislado. Los proyectos nuevos incluyen una branch `production` predeterminada con una base de datos `databricks_postgres`.
* **Compute**: aporta capacidad de procesamiento y memoria a una branch. Cada branch recibe automáticamente un compute `primary` de lectura y escritura. Se pueden añadir réplicas de solo lectura para escalar las lecturas.
* **Database**: una base de datos PostgreSQL dentro de una branch. Para listarlas, usa `databricks postgres list-databases <branch>`.

La CLI y la API denominan **endpoints** a los computes (`ENDPOINT_TYPE_READ_WRITE` para lectura y escritura, `ENDPOINT_TYPE_READ_ONLY` para réplicas de lectura). Los comandos y las rutas de recursos de este documento emplean ese término.

La [referencia de la CLI de `postgres`](https://docs.databricks.com/aws/en/oltp/projects/cli) abarca todos los comandos `databricks postgres`.


## Branching \{#branching\}

Las branches crean entornos de base de datos aislados. Al crear una branch, Lakebase Postgres copia el esquema y los datos de la branch de origen mediante copy-on-write. Las nuevas branches se crean de forma instantánea y solo pagas por los datos que modifiques.

Cada nueva branch obtiene un endpoint de lectura y escritura `primary` en `projects/{project_id}/branches/{branch_id}/endpoints/primary`, que hereda los `default_endpoint_settings` del proyecto. Usa `create-endpoint` para añadir réplicas de lectura (`ENDPOINT_TYPE_READ_ONLY`).

Las branches requieren una política de expiración (`ttl`, `expire_time` o `no_expiry: true`). En [Branch expiration](https://docs.databricks.com/aws/en/oltp/projects/manage-branches#expiration) se detallan todas las opciones. Para los comandos de la CLI, consulta los ejemplos de [Feature branches](/docs/lakebase/development#feature-branches).

:::note
Los identificadores de proyecto, branch, endpoint y base de datos deben tener entre 1 y 63 caracteres, comenzar por una letra minúscula y contener únicamente letras minúsculas, números y guiones.
:::

## Autoscaling \{#autoscaling\}

Los computes escalan automáticamente entre un mínimo y un máximo configurados de unidades de compute (CU). El rango se define por proyecto o por endpoint. Los valores de CU predeterminados, el tamaño máximo de compute y la restricción mín./máx. son configuraciones de Lakebase que cambian con el tiempo, así que consulta [Autoscaling](https://docs.databricks.com/aws/en/oltp/projects/autoscaling) para conocer los valores actuales.

El escalado dentro del rango configurado se produce sin interrumpir las conexiones. Cambiar el mínimo o el máximo puede provocar una breve interrupción.

<details>
<summary>Configurar el autoscaling</summary>

```bash title="Common"
databricks postgres update-endpoint \
  projects/my-project/branches/production/endpoints/primary \
  "spec.autoscaling_limit_min_cu,spec.autoscaling_limit_max_cu" \
  --json '{"spec": {"autoscaling_limit_min_cu": 1.0, "autoscaling_limit_max_cu": 8.0}}'
```

```bash title="All Options"
databricks postgres update-endpoint \
  projects/$PROJECT_ID/branches/$BRANCH_ID/endpoints/$ENDPOINT_ID \
  $UPDATE_MASK \
  --json '{"spec": {
    "autoscaling_limit_min_cu": 1.0,
    "autoscaling_limit_max_cu": 8.0
  }}' \
  --no-wait \
  --timeout 10m \
  --debug \
  -o json \
  --target $TARGET \
  --profile $DATABRICKS_PROFILE
```

<!-- cli-options:postgres update-endpoint -->

| Opción            | Descripción                                                                                                 |
| ----------------- | ----------------------------------------------------------------------------------------------------------- |
| `--json`          | cadena JSON en línea o @ruta/al/archivo.json con el cuerpo de la solicitud (predeterminado: JSON (0 bytes)) |
| `--no-wait`       | no esperar a alcanzar el estado DONE                                                                        |
| `--timeout`       | tiempo máximo para alcanzar el estado DONE                                                                  |
| `--debug`         | habilitar el registro de depuración                                                                         |
| `--output`, `-o`  | tipo de salida: text o json (predeterminado: text)                                                          |
| `--profile`, `-p` | perfil de ~/.databrickscfg                                                                                  |
| `--target`, `-t`  | target del bundle que se utilizará (si corresponde)                                                         |

<!-- /cli-options -->

</details>


## Escalado a cero \{#scale-to-zero\}

El [escalado a cero](https://docs.databricks.com/aws/en/oltp/projects/scale-to-zero) suspende los computes inactivos para eliminar costos. Cuando llega una nueva consulta, el compute se reanuda automáticamente (normalmente en unos pocos cientos de milisegundos).

El tiempo de espera predeterminado es de 24 horas. Puedes establecer cualquier valor entre 60 segundos y 7 días. En las branches de desarrollo, los tiempos de espera más cortos (por ejemplo, 30 minutos) reducen aún más los costos. Las aplicaciones que se conecten a un compute escalado a cero notarán una breve pausa en la primera consulta. Implementa lógica de reintento de conexión en tu aplicación.

Cuando un compute se reanuda, el contexto de la sesión se restablece (tablas temporales, sentencias preparadas, configuración de sesión, pools de conexiones).

<details>
<summary>Configurar el escalado a cero</summary>

Los valores `300s` que aparecen a continuación son tiempos de espera personalizados a modo de ejemplo, no el valor predeterminado (el predeterminado es de 24 horas). Puedes establecer cualquier valor entre 60 segundos y 7 días.

**Valores predeterminados del proyecto** (las nuevas branches heredan esta configuración):

```bash title="Common"
databricks postgres update-project \
  projects/my-project \
  "spec.default_endpoint_settings" \
  --json '{"spec": {"default_endpoint_settings": {"suspend_timeout_duration": "300s"}}}'
```

```bash title="All Options"
databricks postgres update-project \
  projects/$PROJECT_ID \
  $UPDATE_MASK \
  --json '{
    "spec": {
      "default_endpoint_settings": {
        "autoscaling_limit_min_cu": 0.5,
        "autoscaling_limit_max_cu": 1.0,
        "suspend_timeout_duration": "300s"
      }
    }
  }' \
  --no-wait \
  --timeout 10m \
  --debug \
  -o json \
  --target $TARGET \
  --profile $DATABRICKS_PROFILE
```

<!-- cli-options:postgres update-project -->

| Opción            | Descripción                                                                                             |
| ----------------- | ------------------------------------------------------------------------------------------------------- |
| `--json`          | cadena JSON en línea o @ruta/al/archivo.json con el cuerpo de la solicitud (por defecto JSON (0 bytes)) |
| `--no-wait`       | no esperar a que se alcance el estado DONE                                                              |
| `--timeout`       | tiempo máximo para alcanzar el estado DONE                                                              |
| `--debug`         | habilitar el registro de depuración                                                                     |
| `--output`, `-o`  | tipo de salida: text o json (por defecto text)                                                          |
| `--profile`, `-p` | perfil de ~/.databrickscfg                                                                              |
| `--target`, `-t`  | target que se usará (si corresponde)                                                        |

<!-- /cli-options -->

**Por endpoint** (cambiar o deshabilitar en un endpoint existente):

Usa `spec.suspension` como máscara de actualización para todos los cambios de suspensión en `update-endpoint`.

```bash title="Change timeout"
databricks postgres update-endpoint \
  projects/my-project/branches/production/endpoints/primary \
  "spec.suspension" \
  --json '{"spec": {"suspend_timeout_duration": "300s"}}'
```

```bash title="Disable scale to zero"
databricks postgres update-endpoint \
  projects/my-project/branches/production/endpoints/primary \
  "spec.suspension" \
  --json '{"spec": {"no_suspension": true}}'
```

:::note
No se admite establecer `no_suspension: false`; hacerlo devuelve un error. Para volver a habilitar el escalado a cero después de deshabilitarlo, usa `suspend_timeout_duration`.
:::

</details>


## Qué sigue \{#where-to-next\}

Consulta [Desarrollo con Lakebase Postgres](/docs/lakebase/development) para conocer la configuración local, las ramas Feature branch y la API completa del plugin, o explora el [catálogo de plantillas](/templates) para ver patrones completos.