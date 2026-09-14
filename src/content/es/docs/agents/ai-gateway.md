---
title: Unity AI Gateway
sidebar_label: Unity AI Gateway
description: Llama a endpoints de LLM gobernados desde tu aplicación de AppKit con el plugin de Model Serving. Unity AI Gateway añade límites de tasa, seguimiento de uso, guardrails y atribución de costes.
sourceOfTruth:
  skills:
    - databricks-model-serving
  docs:
    - /docs/appkit/v0/plugins/model-serving
    - https://docs.databricks.com/aws/en/ai-gateway/ai-governance
  note: "databricks-model-serving cubre la ruta de llamada al endpoint de serving y los límites de tasa de AI Gateway. La gobernanza completa de AI Gateway, los servicios de modelos y la gobernanza de MCP solo están cubiertos en la documentación (todavía no hay skill)."
---

# Unity AI Gateway \{#unity-ai-gateway\}

**Unity AI Gateway** es la capa de gobernanza de Databricks para endpoints de LLM y servidores MCP. Aplica límites de tasa, impone guardrails y hace seguimiento del uso y del costo. Consulta la [descripción general de Unity AI Gateway](https://docs.databricks.com/aws/en/ai-gateway/) para una introducción completa al producto. Desde tu aplicación de AppKit, puedes llamar a un endpoint gobernado con el plugin de Model Serving. Esta página explica la configuración en AppKit y la CLI para inspeccionar y aprovisionar endpoints.

## Requisitos previos \{#prerequisites\}

- Databricks CLI `v1.0.0+` con un [perfil autenticado](/docs/tools/databricks-cli#authenticate).
- Una app de AppKit en ejecución. Consulta el [inicio rápido de Apps](/docs/apps/quickstart).
- Un endpoint de serving que tu app pueda consultar. La mayoría de los workspaces incluyen modelos fundacionales alojados por Databricks (con el prefijo `databricks-`, por ejemplo `databricks-claude-sonnet-4-6`) preconfigurados con AI Gateway. Los identificadores de los modelos cambian con el tiempo, así que consulta la lista de [modelos compatibles](https://docs.databricks.com/aws/en/machine-learning/foundation-model-apis/supported-models) para conocer los nombres actuales, o ejecuta [Listar endpoints disponibles](#list-available-endpoints) para ver los que expone tu workspace.

## Llamar a un endpoint gobernado desde AppKit \{#call-a-governed-endpoint-from-appkit\}

El [plugin de Model Serving](/docs/appkit/v0/plugins/model-serving) se encarga de la comunicación HTTP, la autenticación y el streaming. Los nombres de los endpoints provienen de variables de entorno en runtime, por lo que el mismo código funciona tanto en local como en producción.

### Registrar el plugin \{#register-the-plugin\}

```typescript title="server/server.ts"
import { createApp, server, serving } from "@databricks/appkit";

const AppKit = await createApp({
  plugins: [
    server(),
    serving({
      endpoints: {
        chat: { env: "DATABRICKS_SERVING_ENDPOINT_NAME" },
      },
    }),
  ],
});
```

`chat` es un alias que eliges tú. El plugin lo resuelve en el momento de la solicitud leyendo `DATABRICKS_SERVING_ENDPOINT_NAME`. Vincula la variable de entorno en `app.yaml`:

```yaml title="app.yaml"
env:
  - name: DATABRICKS_SERVING_ENDPOINT_NAME
    valueFrom: serving-endpoint
```

Al desplegar, Databricks Apps inyecta el nombre del endpoint en el contenedor. Para el desarrollo local, define la variable de entorno en `.env`.


### Streaming desde un componente de React \{#stream-from-a-react-component\}

```tsx title="client/src/ChatPanel.tsx"
import { useState } from "react";
import { useServingStream } from "@databricks/appkit-ui/react";

export function ChatPanel() {
  const [prompt, setPrompt] = useState("");
  const { stream, chunks, streaming, error, reset } = useServingStream(
    { messages: [{ role: "user", content: prompt }], max_tokens: 500 },
    { alias: "chat" },
  );

  return (
    <>
      <input value={prompt} onChange={(e) => setPrompt(e.target.value)} />
      <button onClick={() => stream()} disabled={streaming || !prompt}>
        Send
      </button>
      <button onClick={reset}>Clear</button>
      {chunks.map((chunk, i) => (
        <pre key={i}>{JSON.stringify(chunk)}</pre>
      ))}
      {error && <p>{error}</p>}
    </>
  );
}
```

El primer argumento es el cuerpo de la solicitud. El segundo contiene las opciones, incluido el alias. El hook gestiona la conexión SSE, la cancela al desmontar el componente y acumula en el estado los fragmentos analizados. Para una llamada sin streaming, usa `useServingInvoke` con la misma estructura.

En el caso de los modelos de chat, extrae el texto de cada fragmento (normalmente `chunk.choices?.[0]?.delta?.content`) y concaténalo para mostrarlo. Durante el desarrollo, renderizar los fragmentos sin procesar como JSON te permite confirmar su estructura antes de crear la lógica de visualización.


### Invócalo desde un manejador de rutas \{#call-it-from-a-route-handler\}

Para orquestar agentes, hacer pre o posprocesamiento o registrar eventos en el backend, llama al plugin directamente. De forma predeterminada, las rutas HTTP integradas del plugin se ejecutan como el usuario autenticado. En un manejador de rutas personalizado como este, llama a `.asUser(req)` de forma explícita para obtener el mismo comportamiento por usuario.

```typescript title="server/server.ts"
AppKit.server.extend((app) => {
  app.post("/api/summarize", async (req, res) => {
    const { text } = req.body;
    const result = await AppKit.serving("chat")
      .asUser(req)
      .invoke({
        messages: [
          { role: "system", content: "Summarize the text in two sentences." },
          { role: "user", content: text },
        ],
      });
    res.json(result);
  });
});
```


### Modo con nombre frente a modo predeterminado \{#named-versus-default-mode\}

Los ejemplos anteriores usan el **modo con nombre** con un alias explícito. Omite la configuración para registrar un alias `default` respaldado por `DATABRICKS_SERVING_ENDPOINT_NAME`. El modo con nombre permite escalar a varios endpoints (chat, clasificador, embeddings) dentro de la misma aplicación.

## Gobernanza y Unity AI Gateway \{#governance-and-unity-ai-gateway\}

La gobernanza se aplica en Databricks, no en AppKit. Tu aplicación llama al endpoint y el gateway aplica la política. Unity AI Gateway es el plano de control del tráfico de IA: enruta las solicitudes de modelos y de MCP, y aplica límites de tasa, controles de costes, políticas de servicio y seguimiento del uso. Unity Catalog gobierna los modelos, los servidores MCP y las funciones que hay detrás. Para conocer las funcionalidades y la configuración actuales, incluidas las funcionalidades beta que habilitas desde la página Previews de la consola de la cuenta, consulta [AI governance with Unity AI Gateway](https://docs.databricks.com/aws/en/ai-gateway/ai-governance).

En AppKit, el plugin de Model Serving llama a los endpoints de serving por nombre. Esto incluye modelos fundacionales (con el prefijo `databricks-`), Knowledge Assistants, Supervisor Agents y agentes personalizados de Python. El plugin no llama a los servicios de modelos de Unity AI Gateway, que son objetos de Unity Catalog que se consultan por su nombre completo mediante la API compatible con OpenAI del gateway. Para usar uno, consulta [Query model services](https://docs.databricks.com/aws/en/ai-gateway/query-model-services).

Para más detalles sobre cada uno, consulta:

- Servicios de modelos: [overview](https://docs.databricks.com/aws/en/ai-gateway/model-services) y [governance](https://docs.databricks.com/aws/en/ai-gateway/govern-model-services).
- Servicios de proveedores de modelos: [overview](https://docs.databricks.com/aws/en/ai-gateway/model-provider-services) y [governance](https://docs.databricks.com/aws/en/ai-gateway/govern-model-provider-services).
- Gobernanza de servidores MCP: [register an MCP service](https://docs.databricks.com/aws/en/ai-gateway/register-mcp-service) y [govern it](https://docs.databricks.com/aws/en/ai-gateway/govern-mcp-service). Esto se aplica cuando un endpoint de agente al que llamas, como un Supervisor Agent o un agente personalizado de Python, enruta internamente a un servidor MCP. Las aplicaciones de AppKit no lo configuran directamente.
- Versión anterior: [AI Gateway on serving endpoints](https://docs.databricks.com/aws/en/ai-gateway/overview-serving-endpoints), donde activas funcionalidades por endpoint y los registros de uso se envían a `system.serving.endpoint_usage`.

## Listar los endpoints disponibles \{#list-available-endpoints\}

Usa la CLI para ver qué endpoints expone tu workspace y cuáles ya tienen configuradas las funcionalidades de AI Gateway. Cada comando que aparece a continuación muestra una invocación habitual y su conjunto completo de flags. Ejecuta `databricks serving-endpoints <command> --help` para conocer el comportamiento actual de los flags, ya que la CLI es la fuente de verdad.

```bash title="Common"
databricks serving-endpoints list -o json
```

```bash title="All Options"
databricks serving-endpoints list \
  --limit $LIMIT \
  --debug \
  -o json \
  --target $TARGET \
  --profile $DATABRICKS_PROFILE
```

Los endpoints de la API de modelos fundacionales (con el prefijo `databricks-`) están disponibles en la mayoría de los workspaces, que ya incluyen AI Gateway. Por ejemplo, `databricks-claude-sonnet-4-6`. La disponibilidad varía según el workspace.

<details>
<summary>Ejemplo de salida (truncada)</summary>

```json
[
  {
    "ai_gateway": {
      "usage_tracking_config": { "enabled": true }
    },
    "config": {
      "served_entities": [
        {
          "foundation_model": {
            "display_name": "Claude Sonnet 4.6",
            "name": "system.ai.databricks-claude-sonnet-4-6"
          },
          "name": "databricks-claude-sonnet-4-6"
        }
      ]
    },
    "name": "databricks-claude-sonnet-4-6",
    "state": { "config_update": "NOT_UPDATING", "ready": "READY" },
    "task": "llm/v1/chat"
  }
]
```

</details>

<!-- cli-options:serving-endpoints list -->

| Opción            | Descripción                                    |
| ----------------- | ---------------------------------------------- |
| `--limit`         | Número máximo de resultados a devolver.        |
| `--debug`         | habilita el registro de depuración             |
| `--output`, `-o`  | tipo de salida: text o json (text por defecto) |
| `--profile`, `-p` | perfil de ~/.databrickscfg                     |
| `--target`, `-t`  | target a utilizar (si corresponde)             |

<!-- /cli-options -->


## Inspeccionar un endpoint \{#inspect-an-endpoint\}

```bash
databricks serving-endpoints get databricks-claude-sonnet-4-6 -o json
```

Busca `ai_gateway` en la respuesta para confirmar que AI Gateway está configurado en el endpoint. `get` no acepta flags propios del comando más allá de los globales, así que ejecuta `databricks serving-endpoints get --help` si los necesitas.


## Consultar desde la terminal \{#query-from-the-terminal\}

Resulta útil para hacer una prueba rápida de un endpoint antes de integrarlo en tu aplicación.

```bash title="Common"
databricks serving-endpoints query databricks-claude-sonnet-4-6 \
  --json '{"messages": [{"role": "user", "content": "Hello"}], "max_tokens": 100}'
```

```bash title="All Options"
databricks serving-endpoints query $ENDPOINT_NAME \
  --json '{"messages": [{"role": "user", "content": "Hello"}]}' \
  --max-tokens 100 \
  --n 1 \
  --temperature 0.7 \
  --stream \
  --client-request-id $REQUEST_ID \
  --debug \
  -o json \
  --target $TARGET \
  --profile $DATABRICKS_PROFILE
```

<!-- cli-options:serving-endpoints query -->

| Opción                | Descripción                                                                                                                                       |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--client-request-id` | Identificador de solicitud opcional proporcionado por el usuario que se registrará en la tabla de inferencia y en la tabla de seguimiento de uso. |
| `--json`              | cadena JSON en línea o @ruta/al/archivo.json con el cuerpo de la solicitud (predeterminado JSON (0 bytes))                                        |
| `--max-tokens`        | El campo max tokens que se usa ÚNICAMENTE en endpoints de serving de **completions** y de **chat external &amp; foundation model**.               |
| `--n`                 | El campo n (número de candidatos) que se usa ÚNICAMENTE en endpoints de serving de **completions** y de **chat external &amp; foundation model**. |
| `--stream`            | El campo stream que se usa ÚNICAMENTE en endpoints de serving de **completions** y de **chat external &amp; foundation model**.                   |
| `--temperature`       | El campo temperature que se usa ÚNICAMENTE en endpoints de serving de **completions** y de **chat external &amp; foundation model**.              |
| `--debug`             | habilitar el registro de depuración                                                                                                               |
| `--output`, `-o`      | tipo de salida: text o json (predeterminado text)                                                                                                 |
| `--profile`, `-p`     | perfil de ~/.databrickscfg                                                                                                                        |
| `--target`, `-t`      | target del bundle que se usará (si aplica)                                                                                                        |

<!-- /cli-options -->


## Aprovisionar un endpoint \{#provision-an-endpoint\}

```bash title="Common"
databricks serving-endpoints create my-model-endpoint \
  --json '{
    "config": {
      "served_entities": [
        {
          "name": "my-entity",
          "entity_name": "my-registered-model",
          "workload_size": "Small",
          "scale_to_zero_enabled": true
        }
      ]
    }
  }'
```

```bash title="All Options"
databricks serving-endpoints create $ENDPOINT_NAME \
  --json @config.json \
  --budget-policy-id $BUDGET_POLICY_ID \
  --description "My model endpoint" \
  --route-optimized \
  --no-wait \
  --timeout 20m \
  --debug \
  -o json \
  --target $TARGET \
  --profile $DATABRICKS_PROFILE
```

Espera a que el endpoint alcance el estado `READY` antes de consultarlo. Para ver un recorrido paso a paso, consulta el template [Create a Model Serving Endpoint](/templates/model-serving-endpoint-creation).

<!-- cli-options:serving-endpoints create -->

| Opción               | Descripción                                                                                                |
| -------------------- | ---------------------------------------------------------------------------------------------------------- |
| `--budget-policy-id` | La política de presupuesto que se aplicará al endpoint de serving.                                         |
| `--description`      |                                                                                                            |
| `--json`             | cadena JSON en línea o @ruta/al/archivo.json con el cuerpo de la solicitud (JSON predeterminado (0 bytes)) |
| `--no-wait`          | no esperar a alcanzar el estado NOT&#95;UPDATING                                                           |
| `--route-optimized`  | Habilita la optimización de rutas para el endpoint de serving.                                             |
| `--timeout`          | tiempo máximo para alcanzar el estado NOT&#95;UPDATING (predeterminado 20m0s)                              |
| `--debug`            | habilita el registro de depuración                                                                         |
| `--output`, `-o`     | tipo de salida: text o json (predeterminado text)                                                          |
| `--profile`, `-p`    | perfil de ~/.databrickscfg                                                                                 |
| `--target`, `-t`     | target del bundle que se utilizará (si corresponde)                                                        |

<!-- /cli-options -->


## Integraciones con agentes de programación \{#coding-agent-integrations\}

Unity AI Gateway también puede gobernar herramientas de programación con IA como Cursor, Codex CLI y Gemini CLI, de modo que sus solicitudes compartan una misma factura, un mismo panel de uso y un mismo conjunto de límites de tasa. Databricks recomienda [`ucode`](https://github.com/databricks/ucode) para configurarlo. Consulta [Integrate with coding agents](https://docs.databricks.com/aws/en/ai-gateway/coding-agent-integration-model-services) para conocer los pasos de configuración y la lista actual de herramientas compatibles.

## Qué sigue \{#where-to-next\}

Prueba la [AI Chat App](/templates/ai-chat-app) para integrar un endpoint gobernado en tu aplicación, o explora las demás capacidades de agentes: [Genie Agents](/docs/agents/genie) o [Endpoints de agentes personalizados](/docs/agents/custom-agents).