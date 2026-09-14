Al finalizar, tendrás:

* Una capa bronce proporcionada por las tablas de historial de Change Data Feed de Lakebase upstream (entrada de esta receta)
* Una capa plata con materialized views de estado actual, sin duplicados, para cada entidad
* Una capa oro con agregaciones y métricas de negocio en forma de materialized views
* Un Lakeflow Spark Declarative Pipeline programado que refresca las capas plata y oro de forma incremental
* Todas las capas consultables como tablas de Unity Catalog mediante SQL, Spark, herramientas de BI y Genie