---
title: Endpoints de agentes personalizados
sidebar_label: Agentes personalizados
description: Llama a un Knowledge Assistant, a un Supervisor Agent o a un agente de Python personalizado desde tu aplicación de AppKit. Conecta cualquiera de ellos al plugin de Model Serving.
sourceOfTruth:
  skills:
    - databricks-agent-bricks
  docs:
    - /docs/appkit/v0/plugins/model-serving
    - https://docs.databricks.com/aws/en/agents/agent-bricks/
    - https://docs.databricks.com/aws/en/agents/custom-agents/author-agent
  note: "databricks-agent-bricks covers the Knowledge Assistant and Supervisor builders. Custom Python agent authoring is docs-only (no skill yet)."
---

# Endpoints de agentes personalizados \{#custom-agent-endpoints\}

Cuando tu app de AppKit necesita algo más que la respuesta de un modelo fundacional o una consulta de datos al estilo de Genie, recurres a un **agente personalizado**: un LLM moldeado por instrucciones, herramientas, anclaje en documentos u orquestación multiagente. Puedes ejecutarlo desde AppKit de estas maneras:

* **Ejecútalo dentro de tu App** con el [plugin `agents`](/es/docs/appkit/v0/plugins/agents). Defines el agente en código o en markdown, o ejecutas un Supervisor gestionado a través del adaptador de la API de Supervisor, sin necesidad de desplegar un endpoint aparte. Empieza por aquí si vas a crear tú mismo un agente nuevo.
* **Llama a un agente que ya sea un endpoint de serving** con el [plugin de Model Serving](/es/docs/appkit/v0/plugins/model-serving). Usa esta opción para un Knowledge Assistant o para cualquier agente ya desplegado como endpoint compartido.

## Requisitos previos \{#prerequisites\}

* Databricks CLI `v1.0.0+` con un [perfil autenticado](/es/docs/tools/databricks-cli#authenticate).
* Una app de AppKit en ejecución. Consulta [Inicio rápido de Apps](/es/docs/apps/quickstart).
* Para la ruta del endpoint que se indica a continuación, un agente ya desplegado como endpoint de serving.

## Ejecuta un agente dentro de tu App \{#run-an-agent-inside-your-app\}

El [plugin `agents`](/es/docs/appkit/v0/plugins/agents) aloja el agente en tu App. Lo defines en markdown o en código, conectas las herramientas y queda disponible en rutas integradas, sin necesidad de aprovisionar ningún endpoint. Si vas a crear un agente personalizado o un Supervisor Agent nuevo, empieza aquí.

Para un Supervisor Agent que coordina espacios de Genie, funciones de Unity Catalog u otros agentes, el adaptador de la API de Supervisor ejecuta el agente como un servicio gestionado en Databricks:

```typescript title="server/server.ts"
import { createApp } from "@databricks/appkit";
import {
  agents,
  createAgent,
  DatabricksAdapter,
} from "@databricks/appkit/beta";

await createApp({
  plugins: [
    agents({
      agents: {
        assistant: createAgent({
          instructions: "You are a helpful assistant.",
          model: DatabricksAdapter.fromSupervisorApi({
            model: "databricks-claude-sonnet-4-6",
          }),
        }),
      },
    }),
  ],
});
```

Consulta la [referencia del plugin `agents`](/es/docs/appkit/v0/plugins/agents) para conocer los agentes en markdown, el alcance de las herramientas, los subagentes y las herramientas Supervisor alojadas.

## Llamar a un endpoint de agente existente \{#call-an-existing-agent-endpoint\}

A algunos agentes se accede como un endpoint de Model Serving en lugar de ejecutarlos dentro de la app. Un Knowledge Assistant siempre funciona así, y un Supervisor Agent o un agente de Python personalizado también pueden hacerlo. El plugin de Model Serving los invoca por nombre, igual que a un modelo fundacional. Estos son los builders que generan un endpoint de este tipo:

| Builder             | Úsalo cuando                                                                       | Configuración                                                                                                                                                                |
| ------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Knowledge Assistant | Preguntas y respuestas sobre tus documentos, con citas                                        | [Knowledge Assistant](https://docs.databricks.com/aws/en/agents/agent-bricks/knowledge-assistant) (interfaz del workspace)                                                                                                                      |
| Supervisor Agent    | Coordinar Genie Agents, otros agentes, funciones de Unity Catalog o servidores MCP | [Supervisor Agent](https://docs.databricks.com/aws/en/agents/agent-bricks/multi-agent-supervisor) (interfaz del workspace), o la [API de Supervisor](https://docs.databricks.com/aws/en/agents/agent-bricks/supervisor-api) para crear uno mediante código |
| Agente de Python personalizado | Ninguna otra opción encaja: tu propia orquestación, herramientas o framework                 | [Crear un agente](https://docs.databricks.com/aws/en/agents/custom-agents/author-agent) en Python                                                                                                                                     |

Los builders de Knowledge Assistant y Supervisor Agent se configuran con unos cuantos clics en el workspace. También puedes crearlos desde tu agente de programación con la habilidad de agente [`databricks-agent-bricks`](/es/docs/tools/ai-tools/agent-skills). La [API de Supervisor](https://docs.databricks.com/aws/en/agents/agent-bricks/supervisor-api) define un Supervisor Agent en Python, para los equipos que prefieren el código a la interfaz del workspace.

Desplegar un agente personalizado en su propio endpoint de Model Serving con `agents.deploy()` es una vía heredada. Es preferible ejecutarlo dentro de la app (más arriba); también puedes consultar [Crear un agente](https://docs.databricks.com/aws/en/agents/custom-agents/author-agent) y [Migrar a Databricks Apps](https://docs.databricks.com/aws/en/agents/custom-agents/migrate-agent-to-apps).

## Conéctalo \{#wire-it-up\}

El plugin de Model Serving llama a los endpoints de agentes de la misma forma que a los endpoints de modelos fundacionales. Apunta el plugin a la variable de entorno de tu agente:

```typescript title="server/server.ts"
serving({
  endpoints: {
    assistant: { env: "DATABRICKS_AGENT_ENDPOINT" },
  },
}),
```

Vincula la variable de entorno a un recurso `serving-endpoint` en `app.yaml`:

```yaml title="app.yaml"
env:
  - name: DATABRICKS_AGENT_ENDPOINT
    valueFrom: serving-endpoint
```

Cuando agregas el endpoint del agente como recurso de la app (desde la interfaz de Databricks Apps o la CLI), Databricks otorga el permiso `CAN QUERY` sobre el endpoint al service principal de tu app.

Para ver el patrón de integración completo, incluidos `createApp`, `useServingStream` y los manejadores de rutas personalizados, consulta [Llamar a un endpoint gobernado desde AppKit](/es/docs/agents/ai-gateway#call-a-governed-endpoint-from-appkit).

## Cómo se ve la respuesta \{#what-the-response-looks-like\}

Las respuestas en streaming llegan como fragmentos de `useServingStream`. Las llamadas sin streaming devuelven el objeto completo desde `useServingInvoke`. La estructura de la solicitud suele ser compatible con OpenAI Chat Completions (`messages`, `max_tokens` y, opcionalmente, `stream`). Los endpoints basados en `ResponsesAgent` usan en su lugar la API de OpenAI Responses (`input` en lugar de `messages`).

La estructura de la respuesta depende del builder, así que consúltala en vez de suponerla:

1. Abre tu endpoint de agente en el workspace y haz clic en **Open in Playground**.
2. Haz clic en **Get code** y elige **Curl API** o **Python API**.
3. Ejecuta el ejemplo e inspecciona la respuesta para ver los campos exactos.

## Permisos por usuario \{#per-user-permissions\}

De forma predeterminada, las rutas de serving en AppKit se ejecutan en nombre del usuario autenticado. Si el agente accede a datos con ámbito de usuario (por ejemplo, un Supervisor Agent que redirige a un Genie Agent que el usuario puede consultar), el usuario solo ve los datos que tiene permiso para ver. Sin código de autenticación adicional.

Para la lógica de servidor fuera de las rutas integradas del plugin (por ejemplo, rutas personalizadas de Express), llama a `AppKit.serving("assistant").asUser(req).invoke(...)` para conservar el comportamiento por usuario. Para tareas en segundo plano sin una solicitud (tareas programadas, workers), omite `asUser` y la llamada se ejecutará como el service principal de la aplicación.

## Siguientes pasos \{#where-to-next\}

Prueba la [AI Chat App](/es/templates/ai-chat-app) para ver una configuración completa de AppKit y agentes, o explora el [catálogo de plantillas](/es/templates) para descubrir más patrones.