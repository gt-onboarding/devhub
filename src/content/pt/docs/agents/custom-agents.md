---
title: Endpoints de agentes personalizados
sidebar_label: Agentes personalizados
description: Chame um Knowledge Assistant, um Supervisor Agent ou um agente Python personalizado a partir do seu app AppKit. Integre qualquer um deles ao plugin do Model Serving.
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

Quando o seu app do AppKit precisa de mais do que a resposta de um modelo de fundação ou uma consulta de dados no estilo do Genie, você recorre a um **agente personalizado**: um LLM moldado por instruções, ferramentas, ancoragem em documentos ou orquestração de múltiplos agentes. Há duas formas de executá-lo a partir do AppKit:

* **Execute-o dentro do seu App** com o [plugin `agents`](/pt/docs/appkit/v0/plugins/agents). Você define o agente em código ou markdown, ou executa um Supervisor gerenciado por meio do adaptador da Supervisor API, sem precisar implantar um endpoint separado. Comece por aqui se for criar um agente do zero.
* **Chame um agente que já seja um endpoint de serving** com o [plugin do Model Serving](/pt/docs/appkit/v0/plugins/model-serving). Use esta opção para um Knowledge Assistant ou qualquer agente já implantado como endpoint compartilhado.

## Pré-requisitos \{#prerequisites\}

* Databricks CLI `v1.0.0+` com um [perfil autenticado](/pt/docs/tools/databricks-cli#authenticate).
* Um app AppKit em execução. Consulte o [Início rápido de Apps](/pt/docs/apps/quickstart).
* Para o caminho de endpoint abaixo, um agente já implantado como endpoint de serving.

## Execute um agente dentro do seu App \{#run-an-agent-inside-your-app\}

O [plugin `agents`](/pt/docs/appkit/v0/plugins/agents) hospeda o agente no seu App. Você o define em markdown ou em código, conecta as ferramentas e ele é disponibilizado em rotas integradas, sem nenhum endpoint para provisionar. Para um novo agente personalizado ou supervisor, comece por aqui.

Para um Supervisor que coordena Genie spaces, funções do Unity Catalog ou outros agentes, o adaptador da API do Supervisor executa o agente como um serviço gerenciado no Databricks:

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

Consulte a [referência do plugin `agents`](/pt/docs/appkit/v0/plugins/agents) para saber mais sobre agentes em markdown, definição de escopo de ferramentas, subagentes e ferramentas de Supervisor hospedadas.

## Chamar um endpoint de agente existente \{#call-an-existing-agent-endpoint\}

Alguns agentes são acessados como um endpoint de Model Serving em vez de rodar dentro do app. O Knowledge Assistant é sempre assim; um Supervisor Agent ou um agente Python personalizado também pode ser. O plugin do Model Serving chama qualquer um deles pelo nome, como se fosse um modelo de fundação. Estes são os builders que produzem esse tipo de endpoint:

| Builder             | Use quando                                                                       | Configuração                                                                                                                                                                |
| ------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Knowledge Assistant | Perguntas e respostas sobre seus documentos, com citações                                        | [Knowledge Assistant](https://docs.databricks.com/aws/en/agents/agent-bricks/knowledge-assistant) (interface do workspace)                                                                                                                      |
| Supervisor Agent    | Coordenar Genie Agents, outros agentes, funções do Unity Catalog ou servidores MCP | [Supervisor Agent](https://docs.databricks.com/aws/en/agents/agent-bricks/multi-agent-supervisor) (interface do workspace), ou a [Supervisor API](https://docs.databricks.com/aws/en/agents/agent-bricks/supervisor-api) para criar um via código |
| Agente Python personalizado | Nenhuma outra opção serve: sua própria orquestração, ferramentas ou framework                 | [Author an agent](https://docs.databricks.com/aws/en/agents/custom-agents/author-agent) em Python                                                                                                                                     |

Os builders do Knowledge Assistant e do Supervisor Agent funcionam por cliques na interface do workspace. Você também pode criá-los a partir do seu agente de codificação com a agent skill [`databricks-agent-bricks`](/pt/docs/tools/ai-tools/agent-skills). A [Supervisor API](https://docs.databricks.com/aws/en/agents/agent-bricks/supervisor-api) define um Supervisor Agent em Python, para equipes que preferem código à interface do workspace.

Implantar um agente personalizado em seu próprio endpoint de Model Serving com `agents.deploy()` é um caminho legado. Prefira executá-lo dentro do app (veja acima) ou consulte [Author an agent](https://docs.databricks.com/aws/en/agents/custom-agents/author-agent) e [Migrate to Databricks Apps](https://docs.databricks.com/aws/en/agents/custom-agents/migrate-agent-to-apps).

## Faça a integração \{#wire-it-up\}

O plugin do Model Serving chama endpoints de agentes da mesma forma que chama endpoints de modelos de fundação. Aponte o plugin para a variável de ambiente do seu agente:

```typescript title="server/server.ts"
serving({
  endpoints: {
    assistant: { env: "DATABRICKS_AGENT_ENDPOINT" },
  },
}),
```

Vincule a variável de ambiente a um recurso `serving-endpoint` no `app.yaml`:

```yaml title="app.yaml"
env:
  - name: DATABRICKS_AGENT_ENDPOINT
    valueFrom: serving-endpoint
```

Quando você adiciona o endpoint do agente como um recurso do app (pela interface do Databricks Apps ou pela CLI), o Databricks concede ao service principal do seu app a permissão `CAN QUERY` sobre o endpoint.

Para ver o padrão completo de integração, incluindo `createApp`, `useServingStream` e handlers de rota personalizados, consulte [Chamar um endpoint governado a partir do AppKit](/pt/docs/agents/ai-gateway#call-a-governed-endpoint-from-appkit).

## Como é a resposta \{#what-the-response-looks-like\}

As respostas em streaming chegam como chunks do `useServingStream`. Já as chamadas sem streaming retornam o objeto completo do `useServingInvoke`. O formato da requisição normalmente é compatível com o OpenAI Chat Completions (`messages`, `max_tokens` e, opcionalmente, `stream`). Endpoints construídos sobre o `ResponsesAgent` usam a OpenAI Responses API (`input` no lugar de `messages`).

O formato da resposta varia conforme o builder, então consulte-o em vez de adivinhar:

1. Abra o endpoint do seu agente no workspace e clique em **Open in Playground**.
2. Clique em **Get code** e escolha **Curl API** ou **Python API**.
3. Execute o exemplo e inspecione a resposta para ver os campos exatos.

## Permissões por usuário \{#per-user-permissions\}

Por padrão, as rotas de serving no AppKit são executadas em nome do usuário autenticado. Se o agente acessar dados com escopo de usuário (por exemplo, um Supervisor Agent que roteia para um Genie Agent que o usuário pode consultar), o usuário verá apenas os dados que tem permissão para ver. Sem código de autenticação adicional.

Para lógica de servidor fora das rotas nativas do plugin (por exemplo, rotas Express personalizadas), chame `AppKit.serving("assistant").asUser(req).invoke(...)` para manter o comportamento por usuário. Para tarefas em segundo plano sem uma requisição (tarefas agendadas, workers), omita `asUser` e a chamada será executada como o service principal do app.

## Próximos passos \{#where-to-next\}

Experimente o [AI Chat App](/pt/templates/ai-chat-app) para ver uma configuração completa de AppKit e agentes, ou explore o [catálogo de templates](/pt/templates) para conhecer mais padrões.