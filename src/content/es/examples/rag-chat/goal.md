Este template muestra una aplicación de chat con generación aumentada por recuperación (RAG) creada sobre Databricks: la pregunta del usuario se convierte en un embedding, se recuperan documentos similares de un almacén pgvector en Lakebase Postgres y el contexto recuperado se inyecta en una llamada a Model Serving que devuelve la respuesta en streaming. Las conversaciones y las fuentes se conservan por chat en Lakebase.

### Flujo de datos \{#data-flow\}

Todo el estado de recuperación y de chat reside en Lakebase Postgres; la generación usa Model Serving:

1. **La carga inicial** obtiene un puñado de artículos de Wikipedia al arrancar, los divide en fragmentos por párrafo, genera los embeddings de cada fragmento mediante el endpoint de embeddings del modelo fundacional (`databricks-gte-large-en` de forma predeterminada) y escribe las filas en `rag.documents` con una columna `vector(1024)`.
2. **Los turnos del usuario** se convierten en embeddings con el mismo endpoint. El servidor ejecuta una búsqueda de similitud por coseno con pgvector para recuperar los k fragmentos más similares.
3. **Inyección de contexto**: los fragmentos recuperados se anteponen como mensaje de sistema antes de enviar el historial de conversación del usuario al endpoint de chat completion (`databricks-gpt-5-4-mini` de forma predeterminada) a través de Model Serving.
4. **Streaming**: `streamText` devuelve los tokens al cliente en streaming mientras una devolución de llamada `onFinish` añade el turno del asistente a Lakebase.
5. **Historial de chat**: cada turno del usuario y del asistente se conserva en `chat.messages`, indexado por `chat_id`, de modo que las conversaciones puedan reanudarse.

### Enfoque del template \{#template-approach\}

A diferencia de los demás templates, **este template está diseñado para consumirse mediante `databricks apps init`**, no con `git clone`. El flujo de init:

* Solicita los nombres de la branch de Lakebase Postgres y del recurso de base de datos.
* Resuelve automáticamente `PGHOST`, `PGDATABASE` y `LAKEBASE_ENDPOINT` en tu archivo `.env` local mediante llamadas a las APIs de Lakebase.
* Escribe `DATABRICKS_CONFIG_PROFILE` o `DATABRICKS_HOST` según la configuración de tu CLI de Databricks.
* Te deja en un directorio de proyecto listo para ejecutar, con el nombre indicado en `--name`.

Esto valida el [sistema de templates de AppKit](/docs/appkit/v0/development/templates) como una forma de distribuir templates de DevHub: consulta `appkit.plugins.json` y `.env.tmpl` en el template para ver cómo funciona.

### Qué adaptar \{#what-to-adapt\}

El setup y el aprovisionamiento están documentados en el archivo **`README.md`** del repositorio.

Para hacer tuyo este template:

* **Lakebase**: Apunta el bundle a tu propio project, branch y base de datos de Lakebase (se te solicitan al inicializar).
* **Model Serving endpoint**: Sobrescribe `DATABRICKS_ENDPOINT` para usar otro modelo de chat (por ejemplo, `databricks-claude-sonnet-4-6`).
* **Endpoint de embeddings**: Sobrescribe `DATABRICKS_EMBEDDING_ENDPOINT` si quieres usar otro modelo de embeddings. Asegúrate de que coincida la dimensión `vector(N)` en `server/lib/rag-store.ts`.
* **Datos semilla**: Sustituye la lista de artículos de Wikipedia en `server/lib/seed-data.ts` por tu propio corpus. La función de fragmentación divide el texto en los límites de los párrafos: adáptala si tu fuente tiene otra estructura.
* **Recuperación**: El top-k predeterminado es 5 y la métrica de similitud es el coseno. Ajústalos en `retrieveSimilar()`.