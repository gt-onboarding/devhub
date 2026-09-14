Un pipeline integral de analítica de datos operativos: los datos fluyen desde una base de datos OLTP (Lakebase Postgres) hacia Unity Catalog mediante replicación CDC, se transforman con una arquitectura medallion (capas bronze/silver/gold) y quedan listos para dashboards y consumidores posteriores.

### Componentes \{#components\}

1. **Configuración de Unity Catalog** — configura Unity Catalog con almacenamiento externo en S3 para el catálogo y el schema de destino.
2. **Create a Lakebase Project** — aprovisiona un project de managed Postgres como fuente OLTP.
3. **Lakebase Change Data Feed (CDF)** — habilita la replicación continua desde las tablas de Lakebase hacia las tablas de historial Delta de Unity Catalog.
4. **Arquitectura medallion a partir de CDC** — construye las capas silver (estado actual) y gold (analítica) a partir de las tablas de historial de CDC con Lakeflow Spark Declarative Pipelines.