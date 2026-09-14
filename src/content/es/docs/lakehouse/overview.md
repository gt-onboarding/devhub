---
title: ¿Qué es el Data Lakehouse?
sidebar_label: Descripción general
description: La capa de datos de la Databricks Data Intelligence Platform. Tablas analíticas gobernadas en Unity Catalog y alimentadas por Lakeflow. Documentación complementaria para aplicaciones de AppKit.
sourceOfTruth:
  skills:
    - databricks-dbsql
    - databricks-jobs
    - databricks-pipelines
  docs:
    - /docs/appkit/v0/plugins/analytics
    - /docs/appkit/v0/plugins/jobs
    - https://docs.databricks.com/aws/en/lakehouse/
---

# ¿Qué es el Data Lakehouse? \{#what-is-the-data-lakehouse\}

El Data Lakehouse es la capa analítica de tu workspace de Databricks: tablas y vistas gobernadas por Unity Catalog y alimentadas por Lakeflow. Lakeflow es el conjunto de servicios de ingeniería de datos de Databricks que abarca la ingesta, la orquestación y la gestión de pipelines. Desde una app de AppKit, puedes leer sus tablas, disparar Lakeflow Jobs y mostrar las marcas de tiempo de «última actualización» de los pipelines que las alimentaron.

El [Analytics plugin](/es/docs/appkit/v0/plugins/analytics) se encarga de las lecturas en el SQL warehouse (consulta [Lecturas analíticas](/es/docs/lakehouse/analytical-reads) y [Pipelines y actualidad de los datos](/es/docs/lakehouse/pipelines)). El [Jobs plugin](/es/docs/appkit/v0/plugins/jobs) se encarga de disparar las ejecuciones y seguir su progreso (consulta [Lakeflow Jobs](/es/docs/lakehouse/jobs)).

## Cuándo usar el Data Lakehouse \{#when-to-use-the-data-lakehouse\}

* Necesitas leer datos analíticos curados: ingresos, clientes, eventos, resultados de modelos.
* Muestras agregaciones tipo dashboard o vistas de lista sobre millones de filas.
* Disparas de forma asíncrona el reentrenamiento de modelos, procesos ETL o un backfill prolongado a partir de una acción del usuario.

## Cuándo no usarlo \{#when-not-to-use-it\}

* **Lecturas de menos de un segundo en una solicitud del usuario**, como sugerencias mientras se escribe o autocompletado. Usa [Lakebase Postgres](/es/docs/lakebase/overview) directamente o replica una tabla de UC en Lakebase como tabla sincronizada.
* **Escrituras transaccionales desde tu aplicación** (pedidos, sesiones, registros de auditoría). Usa [Lakebase Postgres](/es/docs/lakebase/overview).
* **Preguntas y respuestas en lenguaje natural sobre tablas gobernadas**. Usa [Genie](/es/docs/agents/genie).

Tampoco escribes pipelines, configuras Spark ni dimensionas clústeres: esas son tareas de ingeniería de datos que se realizan en el workspace de Databricks o mediante [Declarative Automation Bundles](https://docs.databricks.com/aws/en/dev-tools/bundles/).

## Elige un template para empezar \{#pick-a-template-to-start-from\}

Cada uno combina la integración descrita en las páginas anteriores en un patrón funcional.

| Quieres...                                                        | Template                                                            |
| --------------------------------------------------------------------- | ------------------------------------------------------------------- |
| Replicar una tabla de UC en Lakebase para lecturas de baja latencia              | [Sync Tables (Autoscaling)](/es/templates/sync-tables-autoscaling)     |
| Montar el pipeline completo de UC + Change Data Feed de Lakebase + medallion | [Operational Data Analytics](/es/templates/operational-data-analytics) |

## Siguientes pasos \{#where-to-next\}

* [Lecturas analíticas](/es/docs/lakehouse/analytical-reads) con el Analytics plugin, archivos SQL y consultas on-behalf-of-user.
* [Lakeflow Jobs](/es/docs/lakehouse/jobs) para el Jobs plugin, `runNow` y el progreso vía SSE.
* [Pipelines y actualidad de los datos](/es/docs/lakehouse/pipelines) para obtener señales de actualidad mediante el Analytics plugin.