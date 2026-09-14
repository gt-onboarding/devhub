¡Hola mundo, developers.databricks.com!

Lanzamos **developers.databricks.com**, un sitio para desarrolladores que crean aplicaciones internas sobre el workspace de Databricks que tu empresa ya utiliza.

Si tu equipo ya tiene datos en Databricks y quieres construir algo sobre ellos —un chat sobre tu documentación, una herramienta interna agéntica, un frontend de analítica—, este sitio es el camino más corto entre una carpeta vacía y una aplicación desplegada.

## Por qué lo creamos \{#why-we-built-this\}

Somos ingenieros y queríamos el recurso que nos habría gustado tener cuando empezamos a desarrollar en Databricks: centrado en el código, con criterio propio y lo bastante breve como para leerlo de principio a fin. La documentación oficial de Databricks es exhaustiva y está pensada para un público amplio. developers.databricks.com es el complemento orientado a desarrolladores: listo para copiar y pegar, apto para agentes de IA y centrado en los workflows reales de crear, desplegar e iterar sobre Databricks apps, bases de datos Lakebase y componentes de IA de Agent Bricks.

## Plantillas \{#templates\}

Las plantillas son los bloques básicos. Cada una es un prompt en markdown autónomo que te guía (a ti y a tu agente de programación) por un resultado concreto de principio a fin.

Hay tres tipos de plantillas.

### Recetas atómicas \{#atomic-recipes\}

Guías breves y de propósito único para añadir una capacidad concreta a un sistema que ya estás construyendo:

* **[Configura tu entorno de desarrollo local](/templates/set-up-your-local-dev-environment)** — instala la CLI, autentica un perfil y haz una prueba rápida del handshake. El punto de partida para todo lo demás.
* **[Pon en marcha una Databricks App](/templates/spin-up-databricks-app)** — haz scaffold de una nueva Databricks app con AppKit, ejecútala en local y despliégala en tu workspace.
* **[Incorpora tu agente de programación](/templates/onboard-your-coding-agent)** — instala las habilidades de agente de Databricks, conecta el Docs MCP Server e inicializa un `AGENTS.md` para que tu agente conozca los valores predeterminados de tu workspace.
* **[Gestor de archivos en Volumes](/templates/volume-file-upload)** — añade carga de archivos, exploración y vista previa de CSV a tu app mediante Unity Catalog Volumes.

### Recorridos de extremo a extremo \{#end-to-end-walkthroughs\}

Prompts más extensos que combinan varias recetas en un sistema completo, listo para entregar a un agente de programación:

* **[App de chat con IA](/templates/ai-chat-app)** — chat en streaming sobre Model Serving, con el historial de chat persistido en Lakebase.
* **[App con Lakebase](/templates/app-with-lakebase)** — una Databricks app con managed Postgres, configuración del schema y rutas CRUD.
* **[App de analítica con Genie](/templates/genie-analytics-app)** — una Databricks app con analítica conversacional integrada, impulsada por AI/BI Genie.
* **[Lakebase fuera de la plataforma](/templates/lakebase-off-platform)** — uso de Lakebase desde apps alojadas fuera de Databricks (Vercel, Netlify, AWS).
* **[Analítica de datos operativos](/templates/operational-data-analytics)** — Unity Catalog, Lakebase Change Data Feed y un pipeline medallion a partir de tu base de datos operativa.

### Aplicaciones de ejemplo \{#example-apps\}

Guías paso a paso que incluyen una base de código funcional y datos iniciales, para que tú (y tu agent) puedan partir de una aplicación real:

* **[Agentic Support Console](/templates/agentic-support-console)** — Lakebase, Change Data Feed, un pipeline medallion, un job de agent con LLM y una Databricks app con analítica de Genie integrada.
* **[Vacation Rentals Operations Console](/templates/vacation-rentals)** — cola de reservas con flags respaldados por Lakebase y notas del agent, analítica de ingresos con SQL Warehouse y un panel de chat de Genie integrado.
* **[RAG Chat App](/templates/rag-chat)** — RAG en streaming sobre un corpus inicial de Wikipedia, con recuperación mediante pgvector desde Lakebase y generación con Model Serving.

Explóralas todas en la [página de templates](/templates).

## Documentación complementaria \{#companion-docs\}

Las plantillas te dicen *cómo* construir algo. La documentación explica *qué* es realmente la plataforma subyacente, para que tú (y tu agente) podáis tomar decisiones informadas. Cada página es breve y directa. La idea es que sea lo justo para entender cómo encajan entre sí los servicios y los componentes.

* **[Visión general de la plataforma](/docs/platform-overview)** — cómo encajan Databricks Apps, Lakebase, Agent Bricks y Unity Catalog en una app interna.
* **[Databricks Apps](/docs/apps/overview)** — el tiempo de ejecución gestionado donde se despliega tu app, con SSO del workspace, secrets y el SDK de TypeScript [AppKit](/docs/appkit/v0) que lo conecta todo.
* **[Lakebase](/docs/lakebase/overview)** — Postgres gestionado ubicado junto a los datos de tu workspace: cuándo usarlo, cómo aprovisionar una instancia y cómo conectarte desde apps dentro y fuera de la plataforma.
* **[Agent Bricks](/docs/agents/overview)** — la plataforma de agentes: llamadas a modelos fundacionales a través de [Unity AI Gateway](/docs/agents/ai-gateway), analítica conversacional con [Genie](/docs/agents/genie) y [custom agents](/docs/agents/custom-agents).
* **[Herramientas](/docs/tools/databricks-cli)** — la [CLI de Databricks](/docs/tools/databricks-cli), las [habilidades de agente](/docs/tools/ai-tools/agent-skills) para tu agente de programación y el [Docs MCP Server](/docs/tools/ai-tools/docs-mcp-server), que expone cada página de este sitio a los IDE compatibles con MCP.

Empieza en [/docs/start-here](/docs/start-here) si prefieres una visita guiada.

## Diseñado para pegarse en un agente de programación \{#designed-to-be-pasted-into-a-coding-agent\}

La forma en que los desarrolladores lanzan software está cambiando, y el contenido que leemos también tiene que servirles a nuestros agentes. Todos los templates (y páginas de documentación) del sitio son:

* **Markdown listo para copiar y pegar**, pensado para usarse con un agente de programación.
* **Disponibles como markdown sin procesar**, añadiendo `.md` a cualquier URL.
* **Accesibles mediante nuestro [Docs MCP server](/docs/tools/ai-tools/docs-mcp-server)**, para IDEs compatibles con Model Context Protocol.

Un flujo de trabajo que funciona bien:

1. Abre la página de un template en developers.databricks.com.
2. Pulsa el botón **Copy** para obtener la página en markdown.
3. Pégala en tu agente de programación y deja que te guíe durante el desarrollo.
4. Itera en el mismo chat: el agente ya tiene el template completo como contexto.

## Empezar \{#get-started\}

Ve a la [página de inicio](/) y copia el prompt de introducción. A partir de ahí, tu agente te guiará por un flujo de desarrollo completo que abarca Databricks Apps, Lakebase y Agent Bricks.

Estamos ampliando el sitio de forma activa. Si desarrollas en Databricks y hay algún patrón que te gustaría ver cubierto, [abre una issue en GitHub](https://github.com/databricks/devhub/issues): las leemos todas. También puedes sumarte a la conversación con otros desarrolladores de Databricks en el [subreddit r/databricks](https://www.reddit.com/r/databricks).

Te damos la bienvenida a developers.databricks.com.