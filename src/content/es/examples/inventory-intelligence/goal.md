Este template crea un sistema completo de gestión de inventario minorista sobre el stack de Databricks: una aplicación React donde los gerentes de tienda supervisan el estado del inventario, revisan recomendaciones de reabastecimiento generadas por IA y aprueban órdenes de compra, todo ello impulsado por un pipeline medallion en tiempo real y un job de previsión de demanda intercambiable.

### Flujo de datos \{#data-flow\}

Los datos de ventas e inventario fluyen desde Lakebase Postgres a través del lakehouse, se enriquecen con un modelo de previsión de demanda y regresan a la aplicación mediante sincronización inversa:

1. Las **escrituras OLTP** llegan a Lakebase Postgres (tiendas, productos, niveles de inventario, transacciones de ventas, órdenes de reabastecimiento).
2. El **Change Data Feed (CDF) de Lakebase** replica cada cambio en Unity Catalog como tablas de historial CDC (capa bronze).
3. Un **Lakeflow Spark Declarative Pipeline** transforma el historial CDC en tablas silver con el estado actual y materialized views gold (resumen de inventario, alertas de inventario bajo, velocidad de ventas).
4. Un **Lakeflow Job** se ejecuta de forma programada, carga el historial de ventas de la capa silver y ejecuta un modelo de previsión de demanda intercambiable para generar pronósticos de unidades a 30 días y recomendaciones de reabastecimiento en una tabla gold de Delta.
5. Las **tablas de sincronización** (sincronización inversa) replican las tablas gold de vuelta en Lakebase para lecturas de baja latencia.
6. La **Inventory Intelligence App** (Databricks App) lee tanto de las tablas OLTP como de las tablas gold sincronizadas para mostrar dashboards, desgloses por tienda, una cola de reabastecimiento y análisis opcionales con Genie.

### Diseño \{#design\}

La aplicación debe tener un **diseño cuidado y atractivo**: tipografía limpia, espaciado consistente y una estética profesional propia del retail. Usa los componentes de shadcn/ui como base, Tailwind para todos los estilos y los colores de marca en toda la aplicación. Los dashboards deben transmitir riqueza de datos sin resultar recargados, y la cola de reabastecimiento debe hacer que los workflows de aprobación resulten ágiles y sencillos.

### Qué adaptar \{#what-to-adapt\}

El aprovisionamiento (schemas de Unity Catalog, REPLICA IDENTITY de Lakebase), la carga inicial de datos, los despliegues de pipelines, la sincronización inversa y el despliegue de la aplicación están documentados en el **`README.md`** del repositorio, junto al código.

Para adaptar este template a tu caso:

* **Catálogo**: asigna a la variable `catalog` del `databricks.yml` de cada pipeline el nombre de tu catálogo de Unity Catalog.
* **Lakebase**: apunta el `databricks.yml` de la aplicación a tu propio project, branch y base de datos de Lakebase.
* **Tablas**: el script de carga inicial crea el schema OLTP con 5 tiendas, 25 productos y 90 días de historial de ventas. Tras la carga inicial, configura Change Data Feed para replicar las tablas del schema `inventory`.
* **Tablas de sincronización**: crea manualmente las tres configuraciones de sincronización inversa (consulta el README para ver las correspondencias exactas entre tablas).
* **Modelo de previsión**: asigna a la variable `forecast_model` del pipeline de previsión de demanda el valor `weighted_moving_average` (predeterminado), `exponential_smoothing`, `prophet` o `model_serving`.
* **Genie Agent**: crea un Genie Agent sobre tus tablas gold y define `genie_space_id` en el bundle de la aplicación para activar la pestaña de Analítica.