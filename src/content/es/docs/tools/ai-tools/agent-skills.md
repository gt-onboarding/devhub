---
title: Skills de agentes
sourceOfTruth:
  skills:
    - databricks-core
  docs:
    - https://github.com/databricks/databricks-agent-skills
---

# Skills de agente \{#agent-skills\}

Los skills de agente son archivos de instrucciones que los asistentes de programación con IA cargan para realizar tareas de desarrollo en Databricks. Databricks publica sus skills en el repositorio [databricks/databricks-agent-skills](https://github.com/databricks/databricks-agent-skills) y sigue el [estándar abierto de agent skills](https://agentskills.io/).

Los skills le indican a tu agente de programación cómo funciona Databricks: convenciones de la CLI, patrones de autenticación y nombres de recursos, de modo que genere código correcto en lugar de adivinar.

## Instalación \{#install\}

Instala las agent skills oficiales de Databricks con el siguiente comando:

```bash title="Common"
databricks aitools install
```

```bash title="All Options"
databricks aitools install \
  --scope $SCOPE \
  --agents $AGENTS \
  --skills $SKILLS \
  --skills-only \
  --path $OUTPUT_DIR \
  --experimental \
  --debug \
  -o json \
  --target $TARGET \
  --profile $DATABRICKS_PROFILE
```

:::note
Para esto es necesario tener instalada la Databricks CLI. Consulta [Databricks CLI](/docs/tools/databricks-cli) para ver las instrucciones de instalación.
:::

La CLI detecta qué agentes de programación tienes instalados. Para los agentes compatibles con plugins (Claude Code, Codex CLI, GitHub Copilot), instala el plugin `databricks` mediante la propia CLI del agente. Los agentes que no admiten la instalación de plugins en modo headless (Cursor, OpenCode, Antigravity) reciben archivos de skills sin procesar enlazados desde una ubicación compartida (`~/.databricks/aitools/skills/`).

Opciones de `databricks aitools install`:

<!-- cli-options:aitools install -->

| Opción            | Descripción                                                                                           |
| ----------------- | ----------------------------------------------------------------------------------------------------- |
| `--agents`        | Agentes para los que instalar (separados por comas, p. ej. claude-code,cursor)                        |
| `--experimental`  | Incluir skills experimentales                                                                         |
| `--path`          | Escribir los archivos de skills resueltos en este directorio (sin agentes, sin estado)                |
| `--scope`         | Alcance de la instalación: project o global (predeterminado: global, o preguntar en modo interactivo) |
| `--skills`        | Skills específicas a instalar (separadas por comas)                                                   |
| `--skills-only`   | Forzar archivos de skills sin procesar para todos los agentes en lugar del plugin                |
| `--debug`         | habilitar el registro de depuración                                                                   |
| `--output`, `-o`  | tipo de salida: text o json (text de forma predeterminada)                                            |
| `--profile`, `-p` | perfil de ~/.databrickscfg                                                                            |
| `--target`, `-t`  | target a utilizar (si corresponde)                                                                    |

<!-- /cli-options -->

Ten en cuenta que `--skills-only` y `--path` no se pueden combinar.


## Gestionar \{#manage\}

```bash title="List, update, or remove skills"
databricks aitools list
databricks aitools update
databricks aitools uninstall
```

`update` descarga la última versión e instala automáticamente las nuevas skills. Usa `--check` para previsualizar sin descargar, `--no-new` para omitir la instalación automática de nuevas skills, `--no-prune` para conservar las skills eliminadas del manifiesto o `--force` para volver a descargar aunque las versiones coincidan.

`uninstall` elimina los archivos del plugin o de la skill. Usa `--keep-marketplace` para conservar el registro en el marketplace al eliminar un plugin.

Todos los comandos aceptan `--scope` para controlar el alcance: `install` y `uninstall` admiten `project` o `global`; `update` y `list` también aceptan `both` (`list` usa `both` de forma predeterminada).


## Métodos de instalación alternativos \{#alternative-install-methods\}

También puedes instalar las skills de Databricks con la [CLI de Skills](https://github.com/vercel-labs/skills) (por ejemplo, `npx skills add databricks/databricks-agent-skills`) o directamente desde el chat de Cursor con `/add-plugin databricks`. Aun así, `databricks aitools install` es el método recomendado: lo mantiene Databricks y siempre instala las últimas versiones estables.

## Skills disponibles \{#available-skills\}

Ejecuta `databricks aitools list` para ver las skills disponibles y su estado de instalación.

<!-- aitools-skills -->

| Habilidad                                | Descripción                                                                                                                                                                                                                                                                                                                                                                                                                            |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `databricks-agent-bricks`                | Crea Agent Bricks: Knowledge Assistants (KA) para responder preguntas sobre documentos y Supervisor Agents para la orquestación de múltiples agentes (MAS).                                                                                                                                                                                                                                                                            |
| `databricks-ai-functions`                | Use las funciones de IA integradas de Databricks (ai&#95;classify, ai&#95;extract, ai&#95;summarize, ai&#95;mask, ai&#95;translate, ai&#95;fix&#95;grammar, ai&#95;gen, ai&#95;analyze&#95;sentiment, ai&#95;similarity, ai&#95;parse&#95;document, ai&#95;prep&#95;search, ai&#95;query, ai&#95;forecast) para añadir funcionalidades de IA directamente a pipelines de SQL y PySpark sin tener que administrar endpoints de modelos. |
| `databricks-aibi-dashboards`             | Cree paneles de Databricks AI/BI.                                                                                                                                                                                                                                                                                                                                                                                                      |
| `databricks-app-design`                  | Diseña la UX de pantallas de datos de Databricks Apps con código personalizado (AppKit/React): páginas de KPI/resumen, informes, gráficos, tablas y asistentes de datos de Genie/chat, vinculados a componentes concretos de AppKit.                                                                                                                                                                                                   |
| `databricks-apps`                        | Crea aplicaciones en la plataforma Databricks Apps.                                                                                                                                                                                                                                                                                                                                                                                    |
| `databricks-apps-python`                 | Backend de Python para Databricks Apps: FastAPI (predeterminado), Flask, Dash, Streamlit, Gradio, Reflex. **La opción predeterminada para una nueva Databricks App es `databricks-apps` (AppKit — Node/TypeScript/React); empieza por ahí.** Usa esta skill solo cuando el usuario pida un backend de Python, amplíe una aplicación de Python existente o el equipo trabaje únicamente con Python.                                     |
| `databricks-core`                        | Operaciones de Databricks CLI y habilidad principal como punto de entrada para usar Databricks CLI: autenticación, selección de perfiles y bundles.                                                                                                                                                                                                                                                                                    |
| `databricks-dabs`                        | Crea, configura, valida, implementa, ejecuta y administra Declarative Automation Bundles (DABs, anteriormente Databricks Asset Bundles).                                                                                                                                                                                                                                                                                               |
| `databricks-data-discovery`              | Descubra, explore y consulte datos de Databricks mediante Genie: el equivalente en la CLI de Genie One MCP.                                                                                                                                                                                                                                                                                                                            |
| `databricks-dbsql`                       | Funciones avanzadas de Databricks SQL (DBSQL) y capacidades de los SQL warehouses.                                                                                                                                                                                                                                                                                                                                                     |
| `databricks-docs`                        | Referencia de la documentación de Databricks a través del índice llms.txt.                                                                                                                                                                                                                                                                                                                                                             |
| `databricks-execution-compute`           | Ejecute código y administre compute en Databricks: ejecute Python/Scala/SQL/R mediante clústeres sin servidor, clásicos o interactivos, y cree, redimensione o elimine clústeres y SQL warehouses.                                                                                                                                                                                                                                     |
| `databricks-iceberg`                     | Tablas Apache Iceberg en Databricks: tablas Iceberg administradas, lecturas externas de Iceberg (anteriormente Uniform), modo de compatibilidad, catálogo REST de Iceberg (IRC), Iceberg v3, interoperabilidad con Snowflake, PyIceberg, Spark OSS, acceso a motores externos y suministro de credenciales.                                                                                                                            |
| `databricks-jobs`                        | Desarrolle e implemente Lakeflow Jobs en Databricks mediante DAB, el SDK de Python o la CLI.                                                                                                                                                                                                                                                                                                                                           |
| `databricks-lakebase`                    | Databricks Lakebase Postgres: proyectos, escalado, conectividad, tablas sincronizadas de Lakebase y API de datos.                                                                                                                                                                                                                                                                                                                      |
| `databricks-lakeflow-connect`            | Cree pipelines de ingesta administrados en Databricks con Lakeflow Connect.                                                                                                                                                                                                                                                                                                                                                            |
| `databricks-metric-views`                | Vistas de métricas de Unity Catalog: defina, cree, consulte y gestione métricas de negocio gobernadas en YAML.                                                                                                                                                                                                                                                                                                                         |
| `databricks-ml-training`                 | Entrene modelos de ML en Databricks.                                                                                                                                                                                                                                                                                                                                                                                                   |
| `databricks-mlflow-evaluation`           | Evaluación de agentes de GenAI con MLflow 3.                                                                                                                                                                                                                                                                                                                                                                                           |
| `databricks-model-serving`               | Ciclo de vida y operaciones de los endpoints de Model Serving de Databricks.                                                                                                                                                                                                                                                                                                                                                           |
| `databricks-pipelines`                   | Desarrolle Lakeflow Spark Declarative Pipelines (anteriormente, Delta Live Tables) en Databricks.                                                                                                                                                                                                                                                                                                                                      |
| `databricks-python-sdk`                  | Guía para el desarrollo en Databricks, incluidos el SDK de Python, Databricks Connect, la CLI y la API REST.                                                                                                                                                                                                                                                                                                                           |
| `databricks-serverless-migration`        | Migra cargas de trabajo de Databricks de compute clásico a compute sin servidor.                                                                                                                                                                                                                                                                                                                                                       |
| `databricks-spark-structured-streaming`  | Guía completa de Spark Structured Streaming para cargas de trabajo de producción.                                                                                                                                                                                                                                                                                                                                                      |
| `databricks-synthetic-data-gen`          | Genera datos sintéticos realistas con Spark + Faker (muy recomendado).                                                                                                                                                                                                                                                                                                                                                                 |
| `databricks-unity-catalog`               | Gobernanza, control de acceso y observabilidad en Unity Catalog.                                                                                                                                                                                                                                                                                                                                                                       |
| `databricks-unstructured-pdf-generation` | Cree conjuntos de datos para evaluar RAG y documentos no estructurados, así como documentos de demostración (p. ej., para Knowledge Assistant) en Databricks: genere archivos PDF sintéticos de forma local, cárguelos en volúmenes de Unity Catalog y asocie cada documento con preguntas de prueba para evaluar la recuperación.                                                                                                     |
| `databricks-vector-search`               | Endpoints e índices de Databricks Vector Search para RAG y búsqueda semántica; incluye tipos de índices, modos de búsqueda y patrones de RAG integrales                                                                                                                                                                                                                                                                                |
| `databricks-zerobus-ingest`              | Cree clientes de Zerobus Ingest para ingerir datos casi en tiempo real en tablas Delta de Databricks mediante gRPC.                                                                                                                                                                                                                                                                                                                    |

<!-- /aitools-skills -->

Las siguientes skills son experimentales. Para instalarlas, añade `--experimental` a `databricks aitools install`:

<!-- aitools-skills-experimental -->

| Skill                  | Descripción                                                                                                                                    |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `databricks-ai-runtime`    | CLI de Databricks AI Runtime (`air`): la herramienta de línea de comandos para enviar y gestionar cargas de trabajo de entrenamiento con GPU en el compute serverless de Databricks. |
| `databricks-genie`         | Crea y consulta Genie Spaces de Databricks para explorar datos con SQL en lenguaje natural.                                                     |
| `spark-python-data-source` | Crea fuentes de datos personalizadas en Python para Apache Spark con la API DataSource de PySpark: lectores y escritores por lotes y en streaming para sistemas externos. |

<!-- /aitools-skills-experimental -->

## Próximos pasos \{#where-to-next\}

Con las agent skills de Databricks instaladas, tu agente de programación cuenta con el contexto necesario para compilar y desplegar.

- Para darle aún más contexto a tu agente, instala el [Docs MCP Server](/docs/tools/ai-tools/docs-mcp-server).
- ¿Todo listo para empezar a desarrollar? Descubre cómo los [templates](/docs/templates) te permiten generar rápidamente la estructura de tu proyecto.