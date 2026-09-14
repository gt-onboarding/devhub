---
title: Configuración de la app
sidebar_label: Configuración
sourceOfTruth:
  skills:
    - databricks-apps
  docs:
    - /docs/appkit/v0/configuration
    - https://docs.databricks.com/aws/en/dev-tools/databricks-apps/
---

# Configuración de la app \{#app-configuration\}

Dos archivos controlan cómo se inicia tu app de AppKit y a qué se conecta: `app.yaml` (comportamiento en runtime y variables de entorno) y `databricks.yml` (recursos de Databricks). A cada app se le asigna una URL fija al crearla, que no se puede modificar.

:::tip[¿Desarrollas con Python?]

AppKit está orientado a TypeScript sobre Node.js. El desarrollo de apps en Python no se aborda en este sitio. Consulta la [documentación de Databricks Apps](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/) para conocer los frameworks de Python (Gradio, Streamlit, Dash).

:::

## Archivos de configuración \{#configuration-files\}

**`app.yaml`** controla el comportamiento en runtime (comando de inicio y variables de entorno):

```yaml
command: ["npm", "run", "start"]
env:
  - name: LAKEBASE_ENDPOINT
    valueFrom: postgres
  - name: WAREHOUSE_ID
    valueFrom: sql-warehouse
```

El `command` es una secuencia (array), no una cadena de shell. No se admite la expansión de variables de entorno en `command`, salvo para `DATABRICKS_APP_PORT`.

**`databricks.yml`** declara los recursos de Databricks, las variables y los destinos de despliegue:

```yaml
resources:
  apps:
    my-app:
      resources:
        - name: postgres
          postgres:
            branch: ${var.postgres_branch}
            database: ${var.postgres_database}
            permission: CAN_CONNECT_AND_CREATE
```

Las variables como `${var.postgres_branch}` se resuelven a partir de la sección `variables` de `databricks.yml` o de los flags de la CLI en el momento del despliegue.

Para ver la referencia completa de `app.yaml` específica de AppKit, incluidos los resource bindings de plugins, consulta [Configuración de AppKit](/docs/appkit/v0/configuration).


## Manifiesto de plugins \{#plugin-manifest\}

Cada app de AppKit cuenta con un archivo `appkit.plugins.json` que declara qué plugins están activos y qué recursos de Databricks necesitan. Este archivo se genera automáticamente al ejecutar:

```bash
npx @databricks/appkit plugin sync --write
```

Esto se ejecuta automáticamente durante `npm run dev` y `npm run build`. Haz commit del archivo junto con tu código. La CLI y el pipeline de despliegue lo usan para aprovisionar recursos.


## Recursos \{#resources\}

Las apps acceden a los servicios de Databricks mediante recursos declarados. Cada recurso tiene un `name` en `databricks.yml`. Usa ese nombre como valor de `valueFrom` en `app.yaml`.

Las plantillas de AppKit usan nombres convencionales para los recursos gestionados por plugins:

| Recurso                                                                       | Nombre del recurso | Qué proporciona                          |
| ----------------------------------------------------------------------------- | ------------------ | ----------------------------- |
| [Lakebase Postgres](/docs/lakebase/quickstart)                                | `postgres`         | Conexión a PostgreSQL         |
| [SQL Warehouse](https://docs.databricks.com/aws/en/compute/sql-warehouse/)    | `sql-warehouse`    | Ejecución de consultas SQL           |
| [Model Serving](/docs/agents/ai-gateway)                                      | `serving-endpoint` | Inferencia de modelos de IA            |
| [Genie Agent](/docs/agents/genie)                                             | `genie-space`      | Consultas de datos en lenguaje natural |
| [Job](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/resources) | `job`              | Job programado o activado    |
| [UC Volumes](https://docs.databricks.com/aws/en/files/)                       | `volume`           | Almacenamiento de archivos                  |

Encontrarás otros tipos de recursos (tablas de Unity Catalog, conexiones, índices de AI Search (antes Vector Search), experimentos de MLflow, entre otros) en la [documentación oficial de recursos](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/resources).

### Secrets \{#secrets\}

Ninguno de los dos archivos de configuración contiene el valor del secret. `databricks.yml` declara un recurso que apunta a un [secret scope](https://docs.databricks.com/aws/en/security/secrets) y a una clave que tú defines, y `app.yaml` hace referencia a ese recurso por su nombre. La plataforma inyecta el valor descifrado en runtime.

1. Almacena el valor del secret con la Databricks CLI:

   ```bash
   databricks secrets create-scope my-app-secrets
   databricks secrets put-secret my-app-secrets MY_SECRET --string-value "..."
   ```

2. Declara el recurso de tipo secret en `databricks.yml`:

   ```yaml
   resources:
     apps:
       my-app:
         resources:
           - name: my-secret # etiqueta para este recurso (definida por el usuario)
             secret:
               scope: my-app-secrets # nombre del secret scope de Databricks
               key: MY_SECRET # clave dentro de ese scope
               permission: READ
   ```

3. Vincúlalo a una variable de entorno en `app.yaml`:

   ```yaml
   env:
     - name: MY_SECRET
       valueFrom: my-secret # hace referencia al nombre del recurso anterior, no al valor del secret
   ```

En runtime, `MY_SECRET` contiene el valor descifrado del secret. Ninguno de los dos archivos contiene el valor en sí.

## Variables de entorno \{#environment-variables\}

La plataforma inyecta estas variables automáticamente en runtime:

| Variable                   | Descripción                                   |
| -------------------------- | --------------------------------------------- |
| `DATABRICKS_HOST`          | URL del workspace                             |
| `DATABRICKS_APP_PORT`      | Puerto en el que debe escuchar tu app         |
| `DATABRICKS_APP_NAME`      | Nombre de la app                              |
| `DATABRICKS_CLIENT_ID`     | ID de cliente del service principal           |
| `DATABRICKS_CLIENT_SECRET` | Secreto de cliente del service principal      |
| `DATABRICKS_WORKSPACE_ID`  | ID del workspace                              |

Las variables personalizadas se definen en `app.yaml`, dentro de `env`. Usa `value` para texto sin formato y `valueFrom` para [nombres de recursos](#resources). Nunca incluyas secrets en `value`.

## Modelo de autenticación \{#auth-model\}

Cada app cuenta con un service principal dedicado. Databricks inyecta `DATABRICKS_CLIENT_ID` y `DATABRICKS_CLIENT_SECRET` automáticamente en runtime y elimina el service principal cuando se elimina la app.

**La autorización de usuario** (Public Preview) reenvía el token del usuario autenticado mediante la cabecera HTTP `x-forwarded-access-token`. Los ámbitos (por ejemplo, `sql`, `genie`, `files`) se configuran en la interfaz del workspace. Los plugins integrados de [Genie](/docs/agents/genie) y [Model Serving](/docs/agents/ai-gateway) de AppKit lo usan automáticamente. Consulta [contexto de ejecución](/docs/appkit/v0/plugins/execution-context) para ver la implementación en AppKit, o [autorización de apps](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/auth) para conocer todos los detalles de la plataforma.

## Compute \{#compute\}

Los tamaños de compute son `MEDIUM` (el predeterminado), `LARGE` y `XLARGE` (la disponibilidad varía según el workspace). Define el tamaño en la interfaz del workspace o con la opción `--compute-size` en `databricks apps create` y `databricks apps update`. Consulta la [documentación de Databricks Apps](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/) para conocer las vCPU, la RAM y las DBU de cada tamaño.

## Restricciones \{#constraints\}

- No hay sistema de archivos persistente (usa [Lakebase Postgres](/docs/lakebase/quickstart), DBSQL o UC Volumes para la persistencia)
- Los archivos de más de 10 MB hacen que falle el despliegue
- SIGTERM concede 15 segundos antes de SIGKILL
- Runtime: Ubuntu 22.04, Node 22, Python 3.11

Consulta [Mejores prácticas](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/best-practices) para ver las pautas sobre la gestión del apagado, el manejo seguro de los secrets y las redes.

## Estados de la aplicación \{#app-statuses\}

| Estado    | Significado                            |
| --------- | -------------------------------------- |
| Running   | La aplicación funciona correctamente y atiende tráfico |
| Deploying | Hay un despliegue en curso             |
| Crashed   | La aplicación no pudo iniciarse o se cerró |
| Stopped   | La aplicación se detuvo manualmente    |

## Qué sigue \{#where-to-next\}

Consulta [Desarrollo de apps](/docs/apps/development) para conocer la configuración local, los flags de despliegue y la API completa de plugins, o explora el [catálogo de plantillas](/templates) para ver patrones completos.