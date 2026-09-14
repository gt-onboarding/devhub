---
title: Lakeflow Jobs
sidebar_label: Lakeflow Jobs
description: Activa y monitorea Lakeflow Jobs desde tu app de AppKit con el plugin Jobs. Permisos, `runNow` frente a `runAndWait`, sondeo frente a webhooks.
sourceOfTruth:
  skills:
    - databricks-jobs
  docs:
    - /docs/appkit/v0/plugins/jobs
    - https://docs.databricks.com/aws/en/jobs/
---

# Lakeflow Jobs \{#lakeflow-jobs\}

Para delegar trabajo demasiado lento o pesado como para ejecutarlo en un manejador de solicitudes, necesitas un Lakeflow Job, el ejecutor gestionado de Databricks para tareas de notebooks, SQL, dbt y wheels de Python. Ejemplos típicos de trabajo lanzado por una acción del usuario: reentrenamiento de modelos, ETL multitarea o un backfill de SQL prolongado. El [plugin Jobs](/es/docs/appkit/v0/plugins/jobs) conecta tu manejador con un job: decláralo en `databricks.yml` y luego llama a `AppKit.jobs("default").runNow(params)` para lanzar una ejecución o itera `runAndWait` para transmitir el progreso.

Crear jobs es una tarea del workspace que se realiza en Databricks o con [Declarative Automation Bundles](https://docs.databricks.com/aws/en/dev-tools/bundles/). Desde una app de AppKit solo los lanzas. El plugin se encarga del sondeo de las ejecuciones, la transmisión por SSE (Server-Sent Events) y la validación de parámetros con Zod.

## Requisitos previos \{#prerequisites\}

* Databricks CLI `v1.0.0+` con un [perfil autenticado](/es/docs/tools/databricks-cli#authenticate).
* Una app de AppKit en ejecución. Consulta el [Inicio rápido de Apps](/es/docs/apps/quickstart).
* Un Lakeflow Job definido en tu workspace. Consulta [Crea tu primer job](https://docs.databricks.com/aws/en/jobs/) para configurarlo.

## Conecta el plugin Jobs \{#wire-the-jobs-plugin\}

Registra el plugin en `createApp`. Este expone `AppKit.jobs(...)` a tus handlers y lee los IDs de los jobs desde las variables de entorno que vincules en `app.yaml`.

```typescript title="server/server.ts"
import { createApp, jobs, server } from "@databricks/appkit";

await createApp({
  plugins: [server(), jobs()],
});
```

Si no hay una configuración `jobs` explícita, el plugin lee `DATABRICKS_JOB_ID` del entorno y lo registra con la clave `default`. Por ahora no se admiten varios trabajos con nombre en el momento del despliegue, así que vincula un único trabajo a `DATABRICKS_JOB_ID`.

## Vincular el trabajo \{#bind-the-job\}

Declara el trabajo como un recurso en `databricks.yml`. La plataforma de Apps otorga automáticamente el permiso `CAN_MANAGE_RUN` a tu service principal al desplegar:

```yaml title="databricks.yml"
resources:
  apps:
    my-app:
      resources:
        - name: etl-job
          job:
            id: ${var.etl_job_id}
            permission: CAN_MANAGE_RUN
```

Inyecta el ID del job en `app.yaml` como `DATABRICKS_JOB_ID`, la variable de entorno que lee el job predeterminado del plugin:

```yaml title="app.yaml"
env:
  - name: DATABRICKS_JOB_ID
    valueFrom: etl-job
```

Consulta [Configuración de la aplicación](/es/docs/apps/configuration#resources) para ver la lista completa de recursos y la [referencia del plugin Jobs](/es/docs/appkit/v0/plugins/jobs) para conocer las reglas de nomenclatura de las variables de entorno.

## Activar desde un manejador de rutas \{#trigger-from-a-route-handler\}

Usa `runNow` para una ejecución puntual. Envuelve los parameters en un esquema de Zod y el plugin rechazará las entradas no válidas con un `400` antes de llamar al SDK.

```typescript title="server/server.ts"
import { createApp, jobs, server } from "@databricks/appkit";
import { z } from "zod";

const AppKit = await createApp({
  plugins: [
    server(),
    jobs({
      jobs: {
        default: {
          taskType: "notebook",
          params: z.object({
            startDate: z.string(),
            endDate: z.string(),
          }),
        },
      },
    }),
  ],
});

AppKit.server.extend((app) => {
  app.post("/api/etl/run", async (req, res) => {
    const result = await AppKit.jobs("default").runNow({
      startDate: req.body.startDate,
      endDate: req.body.endDate,
    });
    if (!result.ok) return res.status(500).json({ error: result.error });
    res.json({ runId: result.data.run_id });
  });
});
```

Todos los métodos del plugin Jobs devuelven [`ExecutionResult<T>`](/es/docs/appkit/v0/api/appkit/TypeAlias.ExecutionResult). Comprueba `result.ok` antes de leer `result.data`.

Los trabajos se ejecutan como el **service principal** de la aplicación. El resource binding le otorga `CAN_MANAGE_RUN`, de modo que los usuarios pueden lanzar ejecuciones sin grants individuales, y la interfaz de Jobs atribuye cada ejecución al service principal en lugar de al usuario humano. AppKit no ejecuta trabajos en nombre del usuario que ha iniciado sesión, por lo que no hay que configurar ninguna ejecución de trabajos por usuario.

## Transmitir el progreso en tiempo real \{#stream-live-progress\}

El plugin expone un endpoint SSE integrado en `POST /api/jobs/:jobKey/run?stream=true`. Cada evento envía `{ status, timestamp, run }` hasta que finaliza la ejecución.

Para la lógica del servidor, itera directamente sobre `runAndWait`. Es un iterador asíncrono, no una promesa:

```typescript
for await (const status of AppKit.jobs("default").runAndWait({
  startDate,
  endDate,
})) {
  // status.status recorre PENDING, RUNNING, TERMINATED, etc.
}
```

La API completa del hook y los helpers de paginación se documentan en la [referencia del plugin Jobs](/es/docs/appkit/v0/plugins/jobs).

## Permisos \{#permissions\}

| Permiso          | Qué le permite hacer a tu principal                           |
| ---------------- | ------------------------------------------------------------- |
| `CAN_VIEW`       | Leer la definición del job y el historial de ejecuciones.      |
| `CAN_MANAGE_RUN` | Lanzar ejecuciones, cancelarlas y ver su salida.               |
| `CAN_MANAGE`     | Modificar la definición del job. No lo usan las apps de AppKit. |

Define `permission: CAN_MANAGE_RUN` en el resource binding del job. Es la concesión de mínimo privilegio para una app que solo lanza jobs existentes y consulta su estado.

## Sondeo frente a webhooks frente a tablas del sistema \{#polling-versus-webhooks-versus-system-tables\}

Elige el patrón que mejor se ajuste a la duración de la ejecución y a tu interfaz:

* **El endpoint integrado del plugin para ejecutar y esperar** funciona bien cuando el usuario está dispuesto a esperar en la página. El navegador mantiene abierta una conexión SSE mientras el plugin sondea el SDK cada pocos segundos (5 s por defecto, con un tiempo de espera máximo de 10 minutos).
* **Las notificaciones por webhook** son la mejor opción cuando el usuario cierra la pestaña y necesitas el resultado más adelante. Configura los destinos `webhook_notifications.on_success` / `on_failure`, guarda el estado de la ejecución en un almacenamiento duradero (Lakebase resulta cómodo si tu aplicación ya lo usa) y envía las actualizaciones al cliente cuando vuelva a cargar la página.
* **`system.lakeflow.job_run_timeline`** se puede consultar mediante el [Analytics plugin](/es/docs/appkit/v0/plugins/analytics) una vez que tu service principal tenga permiso `SELECT` sobre ella. Resulta útil para paneles de historial de ejecuciones o para análisis entre distintos jobs.

## Qué sigue \{#where-to-next\}

Consulta [Pipelines y actualidad de los datos](/es/docs/lakehouse/pipelines) para conocer el lado de la lectura: cómo mostrar marcas de tiempo de «última actualización» junto a los datos que rellenó un job, o explora el [catálogo de plantillas](/es/templates) para ver otros puntos de partida relacionados.