---
title: Desarrollo de aplicaciones
sidebar_label: Desarrollo
sourceOfTruth:
  skills:
    - databricks-apps
  docs:
    - /docs/appkit/v0
    - https://docs.databricks.com/aws/en/dev-tools/databricks-apps/
---

# Desarrollo de aplicaciones \{#app-development\}

Esta página es la referencia de la CLI y de los flujos de trabajo para Databricks Apps y AppKit. Abarca cómo añadir plugins, hacer scaffolding, desplegar, gestionar y solucionar problemas de tu aplicación.

Cada comando que aparece a continuación muestra una invocación habitual, su conjunto completo de flags y una tabla en la que se describe cada uno. Ejecuta `databricks <command> --help` para conocer el comportamiento actual de los flags, ya que la CLI es la fuente de verdad.

## Configuración local \{#local-setup\}

Copia `.env.example` a `.env` y completa la URL de tu workspace y los ID de los recursos antes de ejecutar `npm run dev`. AppKit los usa para conectarse localmente a los recursos de Databricks.

Ejemplo de `.env` para una app con [Lakebase Postgres](/docs/lakebase/quickstart):

```text
DATABRICKS_HOST=https://<workspace>.cloud.databricks.com
LAKEBASE_ENDPOINT=projects/<project>/branches/production/endpoints/primary
```

Si tu aplicación usa Lakebase, concede también el rol `databricks_superuser` a tu usuario local antes de ejecutarla en local. El service principal de la aplicación crea los esquemas y las tablas en el primer despliegue y es su propietario. Sin este permiso, tu identidad local no podrá acceder a esos objetos:

```sql
GRANT databricks_superuser TO "<your-email>";
```

Consulta [Desarrollo con Lakebase](/docs/lakebase/development#local-database-access) para conocer el flujo de trabajo completo de acceso local.

Para probar con datos de producción sin volver a desplegar, consulta el [puente remoto](/docs/appkit/v0/development/remote-bridge).


## Agregar un plugin \{#add-a-plugin\}

Para agregar un plugin a una app existente, impórtalo y regístralo en `createApp`, dentro de `server/server.ts`:

```typescript
import { createApp, genie, lakebase, server } from "@databricks/appkit";

const AppKit = await createApp({
  plugins: [server(), lakebase(), genie()],
});
```

Luego, regenera `appkit.plugins.json` con los requisitos de recursos actualizados:

```bash
npx @databricks/appkit plugin sync --write
```

Esto se ejecuta automáticamente durante `npm run dev` y `npm run build`. Haz commit del archivo `appkit.plugins.json` actualizado junto con tu código, ya que indica al pipeline de despliegue qué recursos debe aprovisionar.

Consulta la [referencia de plugins de AppKit](/docs/appkit/v0/plugins) para conocer las opciones de configuración de cada plugin, o [Crear plugins personalizados](/docs/appkit/v0/plugins/custom-plugins) para añadir los tuyos.


## Descubrir plugins \{#discover-plugins\}

Lista los plugins disponibles y los campos de recurso que requieren:

```bash title="Common"
databricks apps manifest
```

```bash title="All Options"
databricks apps manifest \
  --template $TEMPLATE_URL \
  --branch $BRANCH \
  --version $APPKIT_VERSION \
  --debug \
  -o json \
  --target $TARGET \
  --var "key=value" \
  --profile $DATABRICKS_PROFILE
```

<!-- cli-options:apps manifest -->

| Opción            | Descripción                                                                                                            |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `--branch`        | Rama o etiqueta de Git (para templates de GitHub, mutuamente excluyente con --version)                                 |
| `--template`      | Ruta del template (directorio local o URL de GitHub)                                                                   |
| `--version`       | Versión de AppKit para el template predeterminado (valor predeterminado: main; usa &#39;latest&#39; para la rama main) |
| `--debug`         | habilita el registro de depuración                                                                                     |
| `--output`, `-o`  | tipo de salida: text o json (text de forma predeterminada)                                                             |
| `--profile`, `-p` | perfil de ~/.databrickscfg                                                                                             |
| `--target`, `-t`  | target que se usará (si corresponde)                                                                        |
| `--var`           | establece valores para las variables definidas en la configuración del bundle. Ejemplo: --var=&quot;key=value&quot;    |

<!-- /cli-options -->


## Opciones de scaffold \{#scaffold-options\}

Usa `databricks apps init` para generar el scaffold de un nuevo proyecto de AppKit. La [Guía rápida de Apps](/docs/apps/quickstart) muestra la vía rápida. Usa estas opciones para un scaffolding no interactivo o avanzado.

```bash title="Common"
databricks apps init --name my-app
```

```bash title="All Options"
databricks apps init \
  --name $APP_NAME \
  --features lakebase,analytics \
  --set lakebase.postgres.project=projects/$PROJECT_ID \
  --set lakebase.postgres.branch=projects/$PROJECT_ID/branches/production \
  --set lakebase.postgres.database=projects/$PROJECT_ID/branches/production/databases/$DB_NAME \
  --set analytics.sql-warehouse.id=$WAREHOUSE_ID \
  --description "My App" \
  --output-dir $OUTPUT_DIR \
  --template $TEMPLATE_URL \
  --branch $BRANCH \
  --deploy \
  --run none \
  --skip-install \
  --version $APPKIT_VERSION \
  --debug \
  -o json \
  --target $TARGET \
  --var "key=value" \
  --profile $DATABRICKS_PROFILE
```

<!-- cli-options:apps init -->

| Opción            | Descripción                                                                                                           |
| ----------------- | --------------------------------------------------------------------------------------------------------------------- |
| `--branch`        | Rama o etiqueta de Git (para templates de GitHub, mutuamente excluyente con --version)                                |
| `--deploy`        | Despliega la app después de crearla                                                                                   |
| `--description`   | Descripción de la app                                                                                                 |
| `--features`      | Funcionalidades/plugins que se habilitarán (separados por comas, según se definan en el manifiesto del template)      |
| `--output-dir`    | Directorio donde se escribirá el proyecto                                                                             |
| `--run`           | Ejecuta la app después de crearla (none, dev, dev-remote)                                                             |
| `--set`           | Establece valores de recursos (formato: plugin.resourceKey.field=value, se pueden indicar varios)                     |
| `--skip-install`  | Omite la instalación de las dependencias del proyecto (p. ej. npm install / uv sync). No se puede combinar con --run. |
| `--template`      | Ruta del template (directorio local o URL de GitHub)                                                                  |
| `--version`       | Versión de AppKit que se usará (por defecto: detección automática; use &#39;latest&#39; para la rama main)            |
| `--debug`         | habilita el registro de depuración                                                                                    |
| `--output`, `-o`  | tipo de salida: text o json (text por defecto)                                                                        |
| `--profile`, `-p` | perfil de ~/.databrickscfg                                                                                            |
| `--target`, `-t`  | target que se usará (si corresponde)                                                                       |
| `--var`           | establece valores para las variables definidas en la configuración del bundle. Ejemplo: --var=&quot;key=value&quot;   |

<!-- /cli-options -->

Al pasar `--name` se omiten los mensajes interactivos y se usan los valores por defecto para las opciones no especificadas. Los nombres de las apps deben estar en minúsculas, separados por guiones y no superar los 26 caracteres. Ejecute `databricks apps manifest` para ver los plugins disponibles y sus claves `--set`.


## Configuración del entorno \{#environment-configuration\}

**Local** (`npm run dev`): variables del archivo `.env` en la raíz del proyecto.

**Desplegado**: variables de las entradas `env` de `app.yaml`. Usa `value` para cadenas de texto simples y `valueFrom` para los resource bindings:

```yaml
env:
  - name: LAKEBASE_ENDPOINT
    valueFrom: postgres
  - name: WAREHOUSE_ID
    valueFrom: sql-warehouse
  - name: APP_LOG_LEVEL
    value: info
```

Los recursos referenciados mediante `valueFrom` deben declararse en `databricks.yml`. Consulta [Configuración de la app](/docs/apps/configuration#resources) para ver la lista completa de recursos.


## Lista de comprobación previa al despliegue \{#pre-deploy-checklist\}

Antes de desplegar en producción:

- La app escucha en `0.0.0.0` en el puerto `DATABRICKS_APP_PORT`
- El comando de `app.yaml` usa sintaxis de array (sin cadenas de shell)
- No hay archivos de más de 10 MB en el proyecto
- Los secrets usan `valueFrom` (nunca `value`)
- `databricks.yml` declara todos los recursos necesarios
- `databricks apps validate` se ejecuta correctamente (`--skip-tests` omite las pruebas para acelerar la ejecución)
- `npm run build` funciona correctamente en local

## Validar \{#validate\}

Ejecuta la validación desde el directorio del proyecto de tu app antes de desplegarla:

```bash
databricks apps validate --profile $DATABRICKS_PROFILE
```

La validación ejecuta una compilación, una verificación de tipos y el linter. Usa `--skip-tests` para una ejecución más rápida.


## Despliegue \{#deploy\}

```bash title="Common"
databricks apps deploy
```

```bash title="All Options"
databricks apps deploy $APP_NAME \
  --deployment-id $DEPLOYMENT_ID \
  --json @$CONFIG_FILE \
  --source-code-path $SOURCE_PATH \
  --git-branch $GIT_BRANCH \
  --git-commit $GIT_COMMIT \
  --git-tag $GIT_TAG \
  --git-source-code-path $GIT_SOURCE_PATH \
  --mode SNAPSHOT \
  --auto-approve \
  --skip-validation \
  --skip-tests \
  --force \
  --no-wait \
  --timeout 20m \
  --debug \
  -o json \
  --target $TARGET \
  --var "key=value" \
  --profile $DATABRICKS_PROFILE
```

<!-- cli-options:apps deploy -->

| Opción                   | Descripción                                                                                                         |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| `--auto-approve`         | Omite las aprobaciones interactivas que pudieran requerirse para el despliegue.                                     |
| `--deployment-id`        | El id único del despliegue.                                                                                         |
| `--force`                | Fuerza la anulación de la validación de la rama de Git.                                                           |
| `--git-branch`           | Rama de Git desde la que se despliega.                                                                            |
| `--git-commit`           | SHA del commit de Git desde el que se despliega.                                                                    |
| `--git-source-code-path` | Ruta relativa al código fuente de la app dentro del repositorio de Git. Por defecto, la raíz del repositorio.       |
| `--git-tag`              | Etiqueta de Git desde la que se despliega.                                                                          |
| `--json`                 | cadena JSON en línea o @ruta/al/archivo.json con el cuerpo de la solicitud (por defecto JSON (0 bytes))             |
| `--mode`                 | El modo con el que el despliegue gestionará el código fuente. Valores admitidos: [AUTO&#95;SYNC, SNAPSHOT]          |
| `--no-wait`              | no esperar a alcanzar el estado SUCCEEDED                                                                           |
| `--skip-tests`           | Omite la ejecución de pruebas durante la validación (por defecto true)                                              |
| `--skip-validation`      | Omite la validación del proyecto (build, typecheck, lint)                                                           |
| `--source-code-path`     | Ruta en el sistema de archivos del workspace del código fuente usado para crear el despliegue de la app.            |
| `--timeout`              | tiempo máximo para alcanzar el estado SUCCEEDED (por defecto 20m0s)                                                 |
| `--debug`                | habilita el registro de depuración                                                                                  |
| `--output`, `-o`         | tipo de salida: text o json (por defecto text)                                                                      |
| `--profile`, `-p`        | perfil de ~/.databrickscfg                                                                                          |
| `--target`, `-t`         | target que se usará (si aplica)                                                                           |
| `--var`                  | establece valores para las variables definidas en la configuración del bundle. Ejemplo: --var=&quot;key=value&quot; |

<!-- /cli-options -->

La CLI valida la configuration, compila el proyecto, lo sube e inicia la app. De forma predeterminada ejecuta la misma validación de proyecto que `databricks apps validate` (build, typecheck, lint). Pasa `--skip-validation` para omitir ese paso. No hace falta indicar `--source-code-path` al desplegar desde un proyecto de AppKit generado con scaffold.


### Verifica el despliegue \{#verify-the-deployment\}

Comprueba que la app se haya desplegado correctamente:

```bash title="Common"
databricks apps get my-app -o json
```

```bash title="All Options"
databricks apps get $APP_NAME \
  -o json \
  --debug \
  --target $TARGET \
  --var "key=value" \
  --profile $DATABRICKS_PROFILE
```

<!-- cli-options:apps get -->

| Opción            | Descripción                                                                                                         |
| ----------------- | ------------------------------------------------------------------------------------------------------------------- |
| `--debug`         | habilita el registro de depuración                                                                                  |
| `--output`, `-o`  | tipo de salida: text o json (text por defecto)                                                                      |
| `--profile`, `-p` | perfil de ~/.databrickscfg                                                                                          |
| `--target`, `-t`  | target que se va a usar (si corresponde)                                                                            |
| `--var`           | establece valores para las variables definidas en la configuración del bundle. Ejemplo: --var=&quot;key=value&quot; |

<!-- /cli-options -->

<details>
<summary>Salida de ejemplo</summary>

```json
{
  "name": "my-app",
  "url": "https://my-app-1234567890.us-west-2.databricksapps.com",
  "description": "A Databricks App powered by AppKit",
  "compute_size": "MEDIUM",
  "app_status": {
    "message": "App has status: App is running",
    "state": "RUNNING"
  },
  "compute_status": {
    "message": "App compute is running.",
    "state": "ACTIVE"
  },
  "active_deployment": {
    "deployment_id": "a1b2c3d4e5f6",
    "source_code_path": "/Workspace/Users/you@example.com/.bundle/my-app/default/files",
    "status": {
      "message": "App started successfully",
      "state": "SUCCEEDED"
    }
  },
  "resources": [
    {
      "name": "postgres",
      "postgres": {
        "branch": "projects/my-project/branches/production",
        "database": "projects/my-project/branches/production/databases/db-abc123",
        "permission": "CAN_CONNECT_AND_CREATE"
      }
    }
  ],
  "service_principal_client_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
}
```

</details>

Ver los registros:

```bash title="Common"
databricks apps logs my-app
```

```bash title="All Options"
databricks apps logs $APP_NAME \
  --follow \
  --tail-lines 200 \
  --timeout 5m \
  --source APP \
  --search "$SEARCH_TERM" \
  --output-file $LOG_FILE \
  --debug \
  -o json \
  --target $TARGET \
  --var "key=value" \
  --profile $DATABRICKS_PROFILE
```

<!-- cli-options:apps logs -->

| Opción            | Descripción                                                                                                                                   |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `--follow`, `-f`  | Transmite los registros de forma continua hasta que se interrumpa.                                                                            |
| `--tail-lines`    | Número de líneas de registro recientes que se muestran antes de la transmisión. Establece 0 para mostrarlas todas. (valor predeterminado 200) |
| `--timeout`       | Tiempo máximo de transmisión cuando se usa --follow. 0 desactiva el tiempo de espera.                                                         |
| `--search`        | Envía un término de búsqueda al servicio de registros antes de la transmisión.                                                                |
| `--source`        | Limita los registros a las fuentes APP o SYSTEM.                                                                                              |
| `--output-file`   | Ruta de archivo opcional donde escribir los registros, además de stdout.                                                                      |
| `--debug`         | habilita el registro de depuración                                                                                                            |
| `--output`, `-o`  | tipo de salida: text o json (valor predeterminado text)                                                                                       |
| `--profile`, `-p` | perfil de ~/.databrickscfg                                                                                                                    |
| `--target`, `-t`  | target que se usará (si corresponde)                                                                                                          |
| `--var`           | establece valores para las variables definidas en la configuración del bundle. Ejemplo: --var=&quot;key=value&quot;                           |

<!-- /cli-options -->


<details>
<summary>Ejemplo de salida de registro</summary>

```text
[SYSTEM] [INFO] Starting Databricks Apps runtime...
[SYSTEM] [INFO] Starting deployment a1b2c3d4e5f6...
[SYSTEM] [INFO] Downloading source code from /Workspace/Users/.../src/a1b2c3d4e5f6
[SYSTEM] [INFO] Installing dependencies...
[BUILD] added 899 packages, and audited 900 packages in 21s
[SYSTEM] [INFO] Dependencies installed successfully.
[SYSTEM] [INFO] Running build script npm run build:server && npm run build:client
[BUILD] ✔ Build complete in 30ms
[BUILD] ✓ built in 2.80s
[SYSTEM] [INFO] Build completed successfully.
[SYSTEM] [INFO] Starting app with command: [npm run start]
[APP] [appkit:lakebase] Lakebase pool initialized
[APP] [appkit:server] Server running on http://0.0.0.0:8000
[APP] [appkit:server] Mode: production (static)
```

</details>


## Gestión de aplicaciones \{#managing-apps\}

```bash title="Common"
databricks apps stop my-app
databricks apps start my-app
databricks apps delete my-app
```

```bash title="All Options"
databricks apps stop $APP_NAME \
  --no-wait \
  --timeout 20m \
  --debug \
  -o json \
  --target $TARGET \
  --var "key=value" \
  --profile $DATABRICKS_PROFILE

databricks apps start $APP_NAME \
  --no-wait \
  --timeout 20m \
  --debug \
  -o json \
  --target $TARGET \
  --var "key=value" \
  --profile $DATABRICKS_PROFILE

databricks apps delete $APP_NAME \
  --auto-approve \
  --force-lock \
  --debug \
  -o json \
  --target $TARGET \
  --var "key=value" \
  --profile $DATABRICKS_PROFILE
```


#### Opciones de `apps stop` \{#apps-stop-options\}

<!-- cli-options:apps stop -->

| Opción            | Descripción                                                                            |
| ----------------- | -------------------------------------------------------------------------------------- |
| `--no-wait`       | no esperar a que se alcance el estado STOPPED                                           |
| `--timeout`       | tiempo máximo para alcanzar el estado STOPPED (predeterminado: 20m0s)                   |
| `--debug`         | habilitar el registro de depuración                                                    |
| `--output`, `-o`  | tipo de salida: text o json (predeterminado: text)                                     |
| `--profile`, `-p` | perfil de ~/.databrickscfg                                                             |
| `--target`, `-t`  | target a utilizar (si corresponde)                                                     |
| `--var`           | establecer valores para las variables definidas en la configuración del bundle. Ejemplo: --var="key=value" |

<!-- /cli-options -->

#### Opciones de `apps start` \{#apps-start-options\}

<!-- cli-options:apps start -->

| Opción            | Descripción                                                                   |
| ----------------- | ----------------------------------------------------------------------------- |
| `--no-wait`       | no esperar a que se alcance el estado ACTIVE                                  |
| `--timeout`       | tiempo máximo para alcanzar el estado ACTIVE (predeterminado: 20m0s)          |
| `--debug`         | habilitar el registro de depuración                                           |
| `--output`, `-o`  | tipo de salida: text o json (predeterminado: text)                            |
| `--profile`, `-p` | perfil de ~/.databrickscfg                                                    |
| `--target`, `-t`  | target que se va a usar (si corresponde)                                      |
| `--var`           | establecer valores para las variables definidas en la configuración del bundle. Ejemplo: --var="key=value" |

<!-- /cli-options -->

#### Opciones de `apps delete` \{#apps-delete-options\}

<!-- cli-options:apps delete -->

| Opción            | Descripción                                                                                    |
| ----------------- | ---------------------------------------------------------------------------------------------- |
| `--auto-approve`  | Omite las aprobaciones interactivas al eliminar recursos y archivos                            |
| `--force-lock`    | Fuerza la adquisición del bloqueo de despliegue.                                               |
| `--debug`         | habilita el registro de depuración                                                             |
| `--output`, `-o`  | tipo de salida: text o json (text por defecto)                                                 |
| `--profile`, `-p` | perfil de ~/.databrickscfg                                                                     |
| `--target`, `-t`  | target a utilizar (si corresponde)                                                             |
| `--var`           | establece valores para las variables definidas en la configuración del bundle. Ejemplo: --var="key=value" |

<!-- /cli-options -->

`apps delete` pide confirmación. Usa `--auto-approve` en CI para omitir esa confirmación.

## CI/CD \{#cicd\}

Para despliegues automatizados en CI, define `DATABRICKS_HOST` y `DATABRICKS_TOKEN` (o usa OAuth con `DATABRICKS_CLIENT_ID` y `DATABRICKS_CLIENT_SECRET`):

```bash
DATABRICKS_HOST=https://<workspace>.cloud.databricks.com \
DATABRICKS_TOKEN=dapi... \
databricks apps deploy
```

O usa un perfil preconfigurado:

```bash
databricks apps deploy --profile ci-profile
```

Consulta la [documentación de autenticación de la Databricks CLI](/docs/tools/databricks-cli#authenticate) para conocer todos los métodos de autenticación.


## Solución de problemas \{#troubleshooting\}

Para obtener más ayuda, consulta [Deploy apps](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/deploy#troubleshoot) y el [puente remoto de AppKit](/docs/appkit/v0/development/remote-bridge) si tienes problemas de conexión local.

- **La app no se despliega**: revisa los registros en busca de mensajes de error, valida la sintaxis de `app.yaml` y verifica que los secrets y las variables de entorno de la sección `env` se resuelvan correctamente. Confirma que todas las dependencias estén incluidas o instaladas.
- **Errores 401 (autenticación)**: verifica que tu token sea válido (`databricks auth token --profile <PROFILE>`), que no haya expirado y que incluya los ámbitos de OAuth necesarios. Los ámbitos de tu token deben ser un superconjunto de los ámbitos configurados para la [autorización de usuario](/docs/appkit/v0/plugins/execution-context) de la app.
- **Errores 403 (permiso denegado)**: verifica que tengas el permiso `CAN USE` sobre la app. Unos ámbitos de OAuth insuficientes también pueden provocar errores 403, incluso con permisos válidos.
- **Errores 404 (app no encontrada)**: verifica que el nombre de la app y la URL del workspace sean correctos, que la app esté desplegada y en ejecución, y que la ruta del endpoint exista.
- **Falla el despliegue desde Git**: en el caso de repositorios privados, verifica que el service principal de la app tenga configurada una credencial de Git. Si despliegas mediante la CLI, la API o DABs, crea primero la app y luego agrega la credencial de Git.

## Documentación de AppKit \{#appkit-docs\}

Accede a la referencia de la API de AppKit, la documentación de componentes y la de plugins desde la terminal:

```bash
npx @databricks/appkit docs                        # explorar el índice de la documentación
npx @databricks/appkit docs --full                 # índice completo con todas las entradas de la API
npx @databricks/appkit docs "<query-or-doc-path>"  # ver una sección o un archivo concreto
```

Ejecútalo sin argumentos para explorar el índice. Resulta útil cuando desarrollas con un asistente de programación con IA: dirígelo aquí en lugar de dejar que adivine la estructura de las API, o consulta la [referencia de AppKit](/docs/appkit/v0) en este sitio.


## Siguientes pasos \{#where-to-next\}

Explora el [catálogo de plantillas](/templates) para empezar a crear tu app o añádele nuevas capacidades: [Lakebase Postgres](/docs/lakebase/overview) para almacenamiento persistente o [Agent Bricks](/docs/agents/overview) para funciones de IA.