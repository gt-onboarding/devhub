Este template reúne todo el stack de desarrollo de Databricks en una única aplicación de datos operativa: una consola de soporte con IA en la que cada mensaje de un cliente se clasifica automáticamente mediante un LLM, y los agentes de soporte revisan, aprueban o descartan la sugerencia desde una herramienta interna creada a medida.

### Flujo de datos \{#data-flow\}

Las interacciones de los clientes fluyen desde la base de datos OLTP de tu aplicación (Lakebase Postgres) hacia el lakehouse mediante CDC, se enriquecen con un agent y se devuelven a la consola de soporte mediante sincronización inversa:

1. Las **escrituras OLTP** llegan a Lakebase Postgres (usuarios, pedidos, casos de soporte, mensajes).
2. **Lakebase Change Data Feed (CDF)** replica cada cambio en Unity Catalog como tablas de historial CDC (capa bronce).
3. Un **Lakeflow Spark Declarative Pipeline** transforma el historial CDC en tablas plata de estado actual y materialized views analíticas de la capa oro (ingresos diarios, panorama de soporte, perfiles de usuario, contexto de casos).
4. Un **Lakeflow Job** se ejecuta cada minuto, detecta los mensajes sin responder, construye un contexto enriquecido a partir de las tablas oro, llama a un LLM mediante un endpoint de serving de Model Serving y combina las respuestas sugeridas en una tabla Delta.
5. Las **synced tables** (sincronización inversa) replican las tablas oro de vuelta en Lakebase para lecturas de baja latencia.
6. La **consola de soporte** (Databricks App) lee tanto de las tablas OLTP como de las tablas oro sincronizadas para mostrar casos, sugerencias de IA y análisis.

### Qué adaptar \{#what-to-adapt\}

El aprovisionamiento (pasos manuales y SQL), la carga inicial de datos, los despliegues de pipelines, la sincronización inversa y el despliegue de la app están documentados en el **`README.md`** del repositorio, junto al código.

Para adaptar este template a tus necesidades:

* **Catálogo**: asigna a la variable `catalog` del `databricks.yml` de cada pipeline el nombre de tu catálogo de Unity Catalog.
* **Lakebase**: apunta el `databricks.yml` de la app a tu propio project, branch y base de datos de Lakebase.
* **Tablas**: el script de carga inicial crea el schema OLTP. Una vez hecha la carga, configura Change Data Feed para replicar las tablas de tu schema `public`.
* **Sync Tables**: crea manualmente las cuatro configuraciones de sincronización inversa (consulta el README para ver las correspondencias exactas entre tablas).
* **Endpoint de serving**: asigna a la variable `endpoint` el endpoint de serving de modelos que prefieras.
* **Genie Agent**: crea un Genie Agent sobre tus tablas oro y define `genie_space_id` en el bundle de la app.