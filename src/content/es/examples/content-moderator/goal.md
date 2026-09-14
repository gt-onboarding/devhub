Este template muestra una herramienta interna de moderación de contenido creada sobre Databricks: los autores envían contenido para distintos canales (blog corporativo, LinkedIn, Twitter, boletín, comunicados de prensa), los moderadores mantienen las directrices de cada canal y un LLM puntúa cada envío según esas directrices antes de que un revisor humano tome la decisión final.

### Flujo de datos \{#data-flow\}

El contenido avanza por un pipeline de revisión respaldado por Lakebase y Model Serving:

1. **Los autores envían contenido** a Lakebase Postgres, indicando un título, un cuerpo y un destino de contenido (blog, LinkedIn, etc.).
2. **La puntuación con IA** se activa automáticamente. El servidor obtiene las directrices activas para ese destino de contenido, envía el contenido junto con las directrices a un endpoint de serving y almacena la puntuación de cumplimiento (0-100), los problemas detectados y las sugerencias de mejora.
3. **Los moderadores revisan** desde una cola que muestra las puntuaciones de IA junto a cada envío. Pueden aprobar, rechazar o solicitar cambios con feedback.
4. **La gestión de directrices** permite a los moderadores crear y actualizar reglas por destino de contenido. Cuando las directrices cambian, los moderadores pueden volver a analizar los envíos existentes.
5. **Las queries del SQL Warehouse** alimentan el dashboard de analítica (número de envíos, tasas de aprobación, puntuaciones medias de cumplimiento por destino).
6. Un **Genie Agent** sobre las tablas de moderación de contenido permite hacer preguntas en lenguaje natural sobre el rendimiento del contenido.

### Qué adaptar \{#what-to-adapt\}

La configuración y el aprovisionamiento están documentados en el archivo **`README.md`** del repositorio.

Para adaptar este template a tus necesidades:

* **Lakebase**: apunta el archivo `databricks.yml` de la app a tu propio proyecto, branch y base de datos de Lakebase.
* **SQL Warehouse**: define el ID del warehouse que ejecutará las queries de analítica.
* **Serving Endpoint**: define el nombre del endpoint de serving del modelo para el análisis de contenido con IA (por ejemplo, `databricks-claude-sonnet-4-6`). La puntuación con IA es opcional: la app funciona sin ella.
* **Genie Agent**: crea un Genie Agent sobre las tablas de `content_moderation` y define el ID del space.
* **Destinos de contenido**: ajusta la lista de destinos en las rutas del servidor y en las utilidades del cliente para que coincida con los canales de contenido de tu organización.
* **Directrices**: sustituye las directrices iniciales por las políticas de contenido reales de tu organización.
* **Datos iniciales**: el script de datos iniciales crea 7 directrices, 10 envíos de ejemplo y 5 revisiones. Sustitúyelos por tus propios datos o usa el formulario de envío de la app.