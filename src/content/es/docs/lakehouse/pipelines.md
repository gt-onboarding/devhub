---
title: Pipelines de Lakeflow y actualidad de los datos
sidebar_label: Pipelines y actualidad
description: Muestra marcas de tiempo que respondan a «¿estos datos están actualizados?» en tu aplicación de AppKit. Consulta los metadatos de actualización de cada tabla y la cronología de actualizaciones del pipeline mediante el plugin Analytics.
sourceOfTruth:
  skills:
    - databricks-pipelines
  docs:
    - /docs/appkit/v0/plugins/analytics
    - https://docs.databricks.com/aws/en/ldp/
---

# Pipelines de Lakeflow y actualidad de los datos \{#lakeflow-pipelines-and-data-freshness\}

Lakeflow Spark Declarative Pipelines (SDP) alimenta las tablas analíticas que lee tu aplicación. Crear pipelines es una tarea de ingeniería de datos que, como desarrollador de AppKit, casi nunca tocarás. Tu trabajo está en el lado de la lectura: mostrar la salida del pipeline y responder «¿está lo bastante actualizado para mostrarlo?» antes de renderizarlo.

Las señales SQL responden a esa pregunta: metadatos de actualización por tabla para vistas materializadas y tablas de streaming, y la línea de tiempo de actualizaciones del pipeline. Ambas pasan por el [plugin de Analytics](/docs/appkit/v0/plugins/analytics) que configuraste en [Lecturas analíticas](/docs/lakehouse/analytical-reads).

Lakeflow es la suite de ingeniería de datos de Databricks. Como desarrollador de AppKit solo lees la salida de los pipelines, pero conviene conocer sus componentes:

- **Lakeflow Connect** para la ingesta, con conectores gestionados que depositan los datos en Unity Catalog.
- **Lakeflow Spark Declarative Pipelines** para la transformación, escritos en SQL o Python, que producen vistas materializadas y tablas de streaming.
- **Lakeflow Jobs** para la orquestación. Consulta [Lakeflow Jobs](/docs/lakehouse/jobs) para ver el lado de la activación desde la aplicación.
- **Lakeflow Designer** para construir pipelines visualmente sin código.

Consulta la [documentación de Lakeflow](https://docs.databricks.com/aws/en/ldp/) para ver toda la familia de productos.

## Señales de actualidad \{#freshness-signals\}

- **Metadatos de actualización por tabla**: `DESCRIBE TABLE EXTENDED <name> AS JSON` devuelve un bloque `refresh_information` para vistas materializadas y tablas de streaming. El bloque contiene `last_refreshed_at`, `last_refresh_type`, `latest_refresh_status`, `latest_refresh_link` y `refresh_schedule`. Consulta [DESCRIBE TABLE](https://docs.databricks.com/aws/en/sql/language-manual/sql-ref-syntax-aux-describe-table) para ver el esquema de salida completo.
- **Cronología de actualizaciones de pipelines**: `system.lakeflow.pipeline_update_timeline` registra cada actualización de un pipeline con `pipeline_id`, `update_id`, `period_start_time`, `period_end_time`, `result_state` (uno de `COMPLETED`, `FAILED`, `CANCELED`) y los detalles del desencadenador. Filtra por `pipeline_id` y `result_state = 'COMPLETED'` para localizar la actualización correcta más reciente del pipeline al que pertenece una tabla. Consulta la [referencia de tablas del sistema](https://docs.databricks.com/aws/en/admin/system-tables/jobs#pipeline-update-timeline) para ver la lista completa de columnas.

Para un diagnóstico más a fondo (estado por flujo, resultados de expectativas, eventos de linaje), usa el [registro de eventos del pipeline](https://docs.databricks.com/aws/en/ldp/monitor-event-logs) mediante la función con valor de tabla `event_log()`. El registro de eventos es el lugar adecuado para responder a «¿por qué falló esta actualización?», no a «¿estos datos son lo bastante recientes como para mostrarlos?».

## Una consulta para la insignia «Última actualización» \{#a-last-updated-badge-query\}

Coloca esto en `config/queries/`. Se ejecuta mediante el plugin de Analytics como cualquier otro archivo SQL.

```sql title="config/queries/last_pipeline_update.obo.sql"
-- @param pipelineId STRING
SELECT period_end_time, result_state
FROM system.lakeflow.pipeline_update_timeline
WHERE pipeline_id = :pipelineId
  AND result_state = 'COMPLETED'
ORDER BY period_end_time DESC
LIMIT 1;
```

Llama al hook desde React con el ID del pipeline:

```tsx
import { useMemo } from "react";
import { sql } from "@databricks/appkit-ui/js";
import { useAnalyticsQuery } from "@databricks/appkit-ui/react";

const params = useMemo(
  () => ({ pipelineId: sql.string("ec2a0ff4-d2a5-4c8c-bf1d-d9f12f10e749") }),
  [],
);
const { data } = useAnalyticsQuery("last_pipeline_update", params);
```

El nombre de archivo `.obo.sql` ejecuta la consulta como el usuario que ha iniciado sesión. Si el service principal de tu aplicación tiene permiso `SELECT` sobre `system.lakeflow.pipeline_update_timeline`, quita el `.obo` y la consulta se ejecutará como la aplicación. Consulta [Crear archivos SQL](/docs/lakehouse/analytical-reads#author-sql-files) para ver la regla completa de nombres de archivo.


## Cómo activar una actualización desde la aplicación \{#triggering-a-refresh-from-the-app\}

No hay un plugin de Pipelines específico en AppKit. Llama al SDK directamente desde tu handler con `w.pipelines.startUpdate({ pipelineId })`, o bien envuelve el pipeline en un [job de Lakeflow](/docs/lakehouse/jobs) y usa el Jobs plugin.

## Qué sigue \{#where-to-next\}

Prueba [Arquitectura Medallion a partir de tablas de historial CDC](/templates/medallion-architecture-from-cdc) para conocer el pipeline SDP canónico que genera estas tablas, o [Análisis de datos operativos](/templates/operational-data-analytics) para el patrón integral de UC + CDC + medallion.