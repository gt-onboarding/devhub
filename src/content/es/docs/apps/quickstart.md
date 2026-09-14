---
title: Inicio rápido
sourceOfTruth:
  skills:
    - databricks-apps
  docs:
    - /docs/appkit/v0
    - https://docs.databricks.com/aws/en/dev-tools/databricks-apps/
---

# Inicio rápido \{#quickstart\}

## Requisitos previos \{#prerequisites\}

* Databricks CLI `v1.0.0+` con un [perfil autenticado](/es/docs/tools/databricks-cli#authenticate)
* Node.js 22+ (las aplicaciones de AppKit están basadas en Node/TypeScript)
* Un workspace de Databricks con Apps habilitado

## Ruta de plantillas \{#template-path\}

Las [plantillas](/es/templates) son prompts listos para agentes, organizados por caso de uso. Elige el que mejor se ajuste, cópialo en tu asistente de programación con IA y el asistente se encarga del scaffolding, la selección de plugins y el despliegue.

Puntos de partida habituales:

| Plantilla                                                                         | Ideal para                                                                   |
| --------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| [Set Up Your Local Dev Environment](/es/templates/set-up-your-local-dev-environment) | Instalar la CLI, autenticarte y verificar el workspace                       |
| [Spin Up a Databricks App](/es/templates/spin-up-databricks-app)                     | Crear el scaffolding de una app de AppKit, ejecutarla en local y desplegarla |
| [Onboard Your Coding Agent](/es/templates/onboard-your-coding-agent)                 | Instalar habilidades de agente y conectar el servidor Docs MCP de DevHub     |
| [AI Chat App](/es/templates/ai-chat-app)                                             | IA conversacional, chatbots, asistentes                                      |
| [App with Lakebase](/es/templates/app-with-lakebase)                                 | Apps CRUD con almacenamiento persistente                                     |

El [catálogo de plantillas](/es/templates) contiene la lista completa, incluidas [Lakebase Postgres](/es/docs/lakebase/quickstart), [Genie Agents](/es/docs/agents/genie), [Unity AI Gateway](/es/docs/agents/ai-gateway) y [Agent Bricks](/es/docs/agents/overview).

Proporciona a tu asistente de IA contexto sobre la plataforma Databricks instalando las [habilidades de agente](/es/docs/tools/ai-tools/agent-skills) antes de copiar la plantilla:

```bash
databricks aitools install
```

## Ruta manual \{#manual-path\}

Sin una plantilla, `databricks apps init` genera un proyecto de AppKit funcional. Esto es lo que genera `--features lakebase` (no tienes que escribirlo tú):

```typescript
import { createApp, lakebase, server } from "@databricks/appkit";

const AppKit = await createApp({
  plugins: [server(), lakebase()],
});

AppKit.server.extend((app) => {
  app.get("/api/items", async (_req, res) => {
    const { rows } = await AppKit.lakebase.query("SELECT * FROM items");
    res.json(rows);
  });
});
```

Genera el proyecto base, ejecútalo en local y despliégalo:

```bash
databricks apps init --name my-app --features lakebase   # genera el proyecto anterior
cd my-app && npm install && npm run dev                  # ejecuta la app localmente
databricks apps deploy                                   # despliega en tu workspace
```

Tras el despliegue, la CLI muestra la URL de tu app en el workspace.

Para generar el proyecto con plugins específicos, pasa `--features` con una lista separada por comas. Ejecuta `databricks apps manifest` para ver todos los plugins disponibles y los campos de recursos que requieren.

## Qué sigue \{#where-to-next\}

Para conocer el flujo de trabajo completo de desarrollo local, las flags de despliegue y la configuración de plugins, consulta [Desarrollo de Apps](/es/docs/apps/development).