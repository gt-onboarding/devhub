---
title: Unity AI Gateway
sidebar_label: Unity AI Gateway
description: Chame endpoints de LLM governados a partir do seu app AppKit usando o plugin de Model Serving. O Unity AI Gateway acrescenta limites de taxa, rastreamento de uso, guardrails e atribuição de custos.
sourceOfTruth:
  skills:
    - databricks-model-serving
  docs:
    - /docs/appkit/v0/plugins/model-serving
    - https://docs.databricks.com/aws/en/ai-gateway/ai-governance
  note: "databricks-model-serving cobre o caminho de chamada do serving endpoint e os limites de taxa do AI Gateway. A governança completa do AI Gateway, os serviços de modelo e a governança de MCP estão apenas na documentação (ainda sem skill)."
---

# Unity AI Gateway \{#unity-ai-gateway\}

O **Unity AI Gateway** é a camada de governança do Databricks para endpoints de LLM e servidores MCP. Ele impõe limites de taxa, aplica guardrails e acompanha uso e custo. Consulte a [visão geral do Unity AI Gateway](https://docs.databricks.com/aws/en/ai-gateway/) para uma introdução completa ao produto. No seu app AppKit, você chama um endpoint governado com o plugin do Model Serving. Esta página aborda a integração com o AppKit e a CLI para inspecionar e provisionar endpoints.

## Pré-requisitos \{#prerequisites\}

- Databricks CLI `v1.0.0+` com um [perfil autenticado](/docs/tools/databricks-cli#authenticate).
- Um app AppKit em execução. Consulte o [Início rápido de Apps](/docs/apps/quickstart).
- Um serving endpoint que seu app possa consultar. A maioria dos workspaces já vem com foundation models hospedados pela Databricks (com o prefixo `databricks-`, por exemplo, `databricks-claude-sonnet-4-6`) pré-configurados com o AI Gateway. Os IDs dos modelos mudam com o tempo, portanto consulte a lista de [modelos suportados](https://docs.databricks.com/aws/en/machine-learning/foundation-model-apis/supported-models) para saber os nomes atuais ou execute [Listar endpoints disponíveis](#list-available-endpoints) para ver o que seu workspace disponibiliza.

## Chamar um endpoint governado a partir do AppKit \{#call-a-governed-endpoint-from-appkit\}

O [plugin de Model Serving](/docs/appkit/v0/plugins/model-serving) cuida da comunicação HTTP, da autenticação e do streaming. Os nomes dos endpoints vêm de variáveis de ambiente em runtime, portanto o mesmo código roda localmente e em produção.

### Registrar o plugin \{#register-the-plugin\}

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

`chat` é um alias definido por você. O plugin o resolve no momento da requisição, lendo `DATABRICKS_SERVING_ENDPOINT_NAME`. Vincule a variável de ambiente no `app.yaml`:

```yaml title="app.yaml"
env:
  - name: DATABRICKS_SERVING_ENDPOINT_NAME
    valueFrom: serving-endpoint
```

Ao fazer o deploy, o Databricks Apps injeta o nome do endpoint no contêiner. Para desenvolvimento local, defina a variável de ambiente no `.env`.


### Fazer streaming a partir de um componente React \{#stream-from-a-react-component\}

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

O primeiro argumento é o corpo da requisição. O segundo contém as opções, incluindo o alias. O hook gerencia a conexão SSE, aborta a chamada ao desmontar o componente e acumula os chunks já parseados no estado. Para uma chamada sem streaming, use `useServingInvoke` com o mesmo formato.

Para modelos de chat, extraia o texto de cada chunk (normalmente `chunk.choices?.[0]?.delta?.content`) e concatene-o para exibição. Durante o desenvolvimento, renderizar os chunks brutos como JSON ajuda a confirmar o formato antes de você criar a lógica de exibição.


### Chamar a partir de um route handler \{#call-it-from-a-route-handler\}

Para orquestração de agentes, pré/pós-processamento ou geração de logs no backend, chame o plugin diretamente. Por padrão, as rotas HTTP integradas do plugin são executadas como o usuário autenticado. Em um route handler personalizado como este, chame `.asUser(req)` explicitamente para obter o mesmo comportamento por usuário.

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


### Modo nomeado versus modo padrão \{#named-versus-default-mode\}

Os exemplos acima usam o **modo nomeado** com um alias explícito. Omita a configuração para registrar um alias `default` baseado em `DATABRICKS_SERVING_ENDPOINT_NAME`. O modo nomeado escala para vários endpoints (chat, classificador, embeddings) no mesmo app.

## Governança e Unity AI Gateway \{#governance-and-unity-ai-gateway\}

A governança é aplicada no Databricks, não no AppKit. Seu aplicativo chama o serving endpoint e o gateway aplica a política. O Unity AI Gateway é o plano de controle do tráfego de IA. Ele roteia requisições de modelos e de MCP e aplica limites de taxa, controles de custo, políticas de serviço e rastreamento de uso. O Unity Catalog governa os modelos, servidores MCP e funções por trás dele. Para conhecer os recursos e a configuração atuais, incluindo os recursos beta que você habilita na página Previews do console da conta, consulte [AI governance with Unity AI Gateway](https://docs.databricks.com/aws/en/ai-gateway/ai-governance).

No AppKit, o plugin do Model Serving chama serving endpoints pelo nome. Isso inclui foundation models (prefixo `databricks-`), Knowledge Assistants, Supervisor Agents e custom Python agents. O plugin não chama os serviços de modelo do Unity AI Gateway, que são objetos do Unity Catalog consultados pelo nome totalmente qualificado por meio da API compatível com OpenAI do gateway. Para usar um deles, consulte [Query model services](https://docs.databricks.com/aws/en/ai-gateway/query-model-services).

Para mais detalhes sobre cada um, consulte:

- Serviços de modelo: [overview](https://docs.databricks.com/aws/en/ai-gateway/model-services) e [governance](https://docs.databricks.com/aws/en/ai-gateway/govern-model-services).
- Serviços de provedores de modelo: [overview](https://docs.databricks.com/aws/en/ai-gateway/model-provider-services) e [governance](https://docs.databricks.com/aws/en/ai-gateway/govern-model-provider-services).
- Governança de servidores MCP: [register an MCP service](https://docs.databricks.com/aws/en/ai-gateway/register-mcp-service) e [govern it](https://docs.databricks.com/aws/en/ai-gateway/govern-mcp-service). Isso se aplica quando um endpoint de agente que você chama, como um Supervisor Agent ou um custom Python agent, roteia internamente para um servidor MCP. Aplicativos do AppKit não fazem essa configuração diretamente.
- Versão anterior: [AI Gateway on serving endpoints](https://docs.databricks.com/aws/en/ai-gateway/overview-serving-endpoints), em que você ativa recursos por endpoint e os logs de uso vão para `system.serving.endpoint_usage`.

## Listar endpoints disponíveis \{#list-available-endpoints\}

Use a CLI para ver quais endpoints seu workspace expõe e quais já têm os recursos do AI Gateway configurados. Cada comando abaixo mostra uma chamada comum e seu conjunto completo de flags. Execute `databricks serving-endpoints <command> --help` para verificar o comportamento atual das flags, já que a CLI é a fonte da verdade.

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

Os endpoints da Foundation Model API (com o prefixo `databricks-`) estão disponíveis na maioria dos workspaces com o AI Gateway integrado. Por exemplo, `databricks-claude-sonnet-4-6`. A disponibilidade varia conforme o workspace.

<details>
<summary>Exemplo de saída (truncado)</summary>

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

| Opção             | Descrição                                 |
| ----------------- | ----------------------------------------- |
| `--limit`         | Número máximo de resultados a retornar.   |
| `--debug`         | ativa o log de depuração                  |
| `--output`, `-o`  | tipo de saída: text ou json (padrão text) |
| `--profile`, `-p` | perfil do ~/.databrickscfg                |
| `--target`, `-t`  | bundle target a ser usado (se aplicável)  |

<!-- /cli-options -->


## Inspecionar um endpoint \{#inspect-an-endpoint\}

```bash
databricks serving-endpoints get databricks-claude-sonnet-4-6 -o json
```

Procure por `ai_gateway` na resposta para confirmar que o AI Gateway está configurado no endpoint. O `get` não aceita flags específicas do comando além das globais; execute `databricks serving-endpoints get --help` caso precise delas.


## Consultar pelo terminal \{#query-from-the-terminal\}

Útil para fazer um teste rápido de um endpoint antes de integrá-lo ao seu app.

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

| Opção                 | Descrição                                                                                                                                     |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `--client-request-id` | Identificador de solicitação opcional fornecido pelo usuário, que será registrado na tabela de inferência e na tabela de rastreamento de uso. |
| `--json`              | string JSON inline ou @caminho/para/arquivo.json com o corpo da solicitação (padrão JSON (0 bytes))                                           |
| `--max-tokens`        | O campo max tokens usado APENAS para serving endpoints de **completions** e **chat external &amp; foundation model**.                      |
| `--n`                 | O campo n (número de candidatos) usado APENAS para serving endpoints de **completions** e **chat external &amp; foundation model**.        |
| `--stream`            | O campo stream usado APENAS para serving endpoints de **completions** e **chat external &amp; foundation model**.                          |
| `--temperature`       | O campo temperature usado APENAS para serving endpoints de **completions** e **chat external &amp; foundation model**.                     |
| `--debug`             | ativa o log de depuração                                                                                                                      |
| `--output`, `-o`      | tipo de saída: text ou json (padrão text)                                                                                                     |
| `--profile`, `-p`     | perfil do ~/.databrickscfg                                                                                                                    |
| `--target`, `-t`      | bundle target a ser usado (se aplicável)                                                                                                      |

<!-- /cli-options -->


## Provisionar um endpoint \{#provision-an-endpoint\}

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

Aguarde até o endpoint atingir o estado `READY` antes de consultá-lo. Para um passo a passo detalhado, consulte o template [Create a Model Serving Endpoint](/templates/model-serving-endpoint-creation).

<!-- cli-options:serving-endpoints create -->

| Opção                | Descrição                                                                                          |
| -------------------- | -------------------------------------------------------------------------------------------------- |
| `--budget-policy-id` | A política de orçamento a ser aplicada ao serving endpoint.                                        |
| `--description`      |                                                                                                    |
| `--json`             | string JSON inline ou @caminho/para/arquivo.json com o corpo da requisição (padrão JSON (0 bytes)) |
| `--no-wait`          | não aguardar até atingir o estado NOT&#95;UPDATING                                                 |
| `--route-optimized`  | Habilita a otimização de rotas para o serving endpoint.                                            |
| `--timeout`          | tempo máximo para atingir o estado NOT&#95;UPDATING (padrão 20m0s)                                 |
| `--debug`            | habilita o log de depuração                                                                        |
| `--output`, `-o`     | tipo de saída: text ou json (padrão text)                                                          |
| `--profile`, `-p`    | perfil do ~/.databrickscfg                                                                         |
| `--target`, `-t`     | bundle target a ser usado (se aplicável)                                                           |

<!-- /cli-options -->


## Integrações com agentes de programação \{#coding-agent-integrations\}

O Unity AI Gateway também pode governar ferramentas de programação com IA como Cursor, Codex CLI e Gemini CLI, de modo que suas requisições compartilhem uma única fatura, um único painel de uso e um mesmo conjunto de limites de taxa. A Databricks recomenda o [`ucode`](https://github.com/databricks/ucode) para fazer essa configuração. Consulte [Integrate with coding agents](https://docs.databricks.com/aws/en/ai-gateway/coding-agent-integration-model-services) para ver as etapas de configuração e a lista atual de ferramentas compatíveis.

## Próximos passos \{#where-to-next\}

Experimente o [AI Chat App](/templates/ai-chat-app) para integrar um endpoint governado ao seu app ou explore os outros recursos de agentes: [Genie Agents](/docs/agents/genie) ou [Endpoints de agentes personalizados](/docs/agents/custom-agents).