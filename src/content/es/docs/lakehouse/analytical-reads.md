---
title: Leer tablas de Unity Catalog
sidebar_label: Lecturas analíticas
description: Lee tablas gobernadas de Unity Catalog desde tu aplicación de AppKit con el Analytics plugin. Archivos SQL, consultas on-behalf-of-user y vinculación del recurso SQL warehouse.
sourceOfTruth:
  skills:
    - databricks-dbsql
    - databricks-unity-catalog
  docs:
    - /docs/appkit/v0/plugins/analytics
    - https://docs.databricks.com/aws/en/sql/
    - https://docs.databricks.com/aws/en/data-governance/unity-catalog/
---

# Leer tablas de Unity Catalog \{#read-unity-catalog-tables\}

Para ejecutar consultas analíticas sobre tablas de Databricks desde tu aplicación de AppKit, necesitas un SQL warehouse (el compute de SQL de Databricks). El [Analytics plugin](/es/docs/appkit/v0/plugins/analytics) conecta tu handler con uno: los archivos SQL van en `config/queries/`, el warehouse los ejecuta y devuelve filas tipadas. Tu handler no verifica permisos.

Las tablas que consulta el warehouse se rigen por Unity Catalog (UC). UC controla el espacio de nombres de tres niveles (`catalog.schema.object`) y aplica grants, filtros de filas, máscaras de columnas y políticas ABAC (control de acceso basado en atributos) en cada acceso. Además de las tablas, UC también gobierna vistas, vistas materializadas, volúmenes, modelos, índices de vector search y funciones registradas.

## Requisitos previos \{#prerequisites\}

* Databricks CLI `v1.0.0+` con un [perfil autenticado](/es/docs/tools/databricks-cli#authenticate).
* Una aplicación de AppKit en ejecución. Consulta la [guía de inicio rápido de Apps](/es/docs/apps/quickstart).
* Un SQL warehouse declarado como recurso de la aplicación en `databricks.yml`. El service principal de tu aplicación obtiene `CAN_USE` automáticamente al vincular el recurso. Los permisos de los usuarios finales se explican [más adelante](#where-403s-come-from).

## Qué lee el Analytics plugin \{#what-the-analytics-plugin-reads\}

Todos los objetos de UC residen en un espacio de nombres `catalog.schema.object`. Estos son los objetos que consulta el plugin:

* **Tablas** (Delta e Iceberg).
* **Vistas** y **vistas materializadas**.
* **Tablas de streaming**.
* **Funciones** invocadas como `SELECT my_catalog.my_schema.my_function(...)`.

Los demás objetos de UC se usan con otros plugins. Los volúmenes (almacenamiento de archivos) se manejan a través del [plugin Files](/es/docs/appkit/v0/plugins/files). La lista completa de objetos de UC está en [Securable objects](https://docs.databricks.com/aws/en/data-governance/unity-catalog/securable-objects).

## Conecta el Analytics plugin \{#wire-the-analytics-plugin\}

Registra el Analytics plugin en `createApp`. Expone endpoints de Analytics y lee las consultas de `config/queries/` ejecutándolas en el SQL warehouse que vincules en `app.yaml`.

```typescript title="server/server.ts"
import { analytics, createApp, server } from "@databricks/appkit";

await createApp({
  plugins: [server(), analytics({})],
});
```

Vincula el SQL warehouse en `app.yaml` para que la plataforma defina `DATABRICKS_WAREHOUSE_ID` al iniciar:

```yaml title="app.yaml"
env:
  - name: DATABRICKS_WAREHOUSE_ID
    valueFrom: sql-warehouse
```

El recurso correspondiente se define en `databricks.yml`. Consulta [Configuración de la app](/es/docs/apps/configuration#resources) para ver la lista completa de recursos y las claves `valueFrom`.

## Escribe los archivos SQL \{#author-sql-files\}

Coloca los archivos `.sql` en `config/queries/`. El nombre del archivo sin `.sql` pasa a ser la clave de la consulta.

```sql title="config/queries/spend_summary.sql"
-- @param startDate DATE
-- @param endDate DATE
SELECT date_trunc('day', usage_date) AS day, SUM(usage_quantity) AS qty
FROM system.billing.usage
WHERE usage_date BETWEEN :startDate AND :endDate
GROUP BY 1
ORDER BY 1;
```

El contexto de ejecución se define según el nombre del archivo:

* `spend_summary.sql` se ejecuta como el **service principal de la app**. La caché se comparte entre todos los usuarios.
* `spend_summary.obo.sql` se ejecuta como el **usuario que inició sesión**. La caché es por usuario. Unity Catalog aplica los permisos, los filtros de fila, las máscaras de columna y las políticas ABAC de ese usuario.

Para ver la API completa del plugin, incluidos los tipos de parámetros y el streaming con Arrow, consulta la [referencia del Analytics plugin](/es/docs/appkit/v0/plugins/analytics).

## Renderizar en React con `useAnalyticsQuery` \{#render-in-react-with-useanalyticsquery\}

```tsx title="client/src/SpendTable.tsx"
import { useMemo } from "react";
import { sql } from "@databricks/appkit-ui/js";
import { useAnalyticsQuery } from "@databricks/appkit-ui/react";

export function SpendTable() {
  const params = useMemo(
    () => ({
      startDate: sql.date("2025-01-01"),
      endDate: sql.date("2025-12-31"),
    }),
    [],
  );

  const { data, loading, error } = useAnalyticsQuery("spend_summary", params);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;
  return (
    <ul>
      {data?.map((row) => (
        <li key={row.day}>
          {row.day}: {row.qty}
        </li>
      ))}
    </ul>
  );
}
```

:::important[Envuelve los parámetros en useMemo]
`useAnalyticsQuery` vuelve a consultar los datos cada vez que cambia la referencia de sus parámetros. Un objeto en línea crea una referencia nueva en cada renderizado, lo que genera un bucle infinito. Envuelve los parámetros en `useMemo`.
:::

## De dónde vienen los errores 403 \{#where-403s-come-from\}

El nombre del archivo determina la identidad asociada a cada consulta:

* **Las consultas con service principal** (`*.sql`) usan el service principal de la app. El SP necesita `SELECT` sobre las tablas subyacentes. Los errores de permisos devuelven `403` desde el warehouse.
* **Las consultas on-behalf-of-user** (`*.obo.sql`) usan la identidad del usuario que inició sesión. UC aplica sus permisos automáticamente. Si el usuario no tiene `SELECT`, o si un filtro de filas o una máscara de columnas oculta los datos, la llamada devuelve un `403` o menos filas. No tienes que escribir la comprobación de permisos.

:::note[La autorización on-behalf-of-user debe estar habilitada]

Un administrador del workspace debe habilitar la autorización on-behalf-of-user antes de poder añadir scopes a tu app. Consulta [App authorization](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/auth) para conocer los detalles de la plataforma.

:::

## Lakehouse Federation \{#lakehouse-federation\}

Lakehouse Federation hace que las fuentes externas (Snowflake, BigQuery, Oracle, Redshift) se muestren como catálogos de UC. Una vez registradas, el Analytics plugin las trata como cualquier otra tabla de UC: la misma referencia `catalog.schema.table`, el mismo archivo SQL, el mismo OBO. El warehouse delega (pushdown) filtros y agregaciones a la fuente externa siempre que es posible, y lee los datos restantes en el momento de la consulta sin persistirlos en UC. Consulta [Lakehouse Federation](https://docs.databricks.com/aws/en/query-federation/) para ver la lista de fuentes, la configuración y la cobertura de pushdown de cada fuente.

## Consultas en lenguaje natural \{#natural-language-queries\}

Para preguntas y respuestas en lenguaje natural sobre tablas de UC (conjuntos de datos curados, más un almacén de conocimiento y un sistema de IA compuesto que convierte las preguntas en SQL), usa [Genie](/es/docs/agents/genie). Para ver una configuración funcional, consulta la plantilla [Genie Conversational Analytics](/es/templates/genie-conversational-analytics). El plugin de Genie está en la sección de Agent Bricks porque es una integración de agentes, no de SQL.

## Qué sigue \{#where-to-next\}

Prueba [Configurar Unity Catalog con almacenamiento externo](/es/templates/unity-catalog-setup) para aprovisionar un catálogo, o [Volume File Manager](/es/templates/volume-file-upload) para añadir volúmenes de UC a tu aplicación. Después, explora [Lakeflow Jobs](/es/docs/lakehouse/jobs) para disparar tareas, o [Canalizaciones y actualidad de los datos](/es/docs/lakehouse/pipelines) para obtener señales de «última actualización».