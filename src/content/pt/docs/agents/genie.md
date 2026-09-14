---
title: Genie Agents
sidebar_label: Genie
description: Incorpore uma interface de chat sobre tabelas do Unity Catalog com o plugin Genie do AppKit e o componente GenieChat. Sem código text-to-SQL, sem prompts, sem LLM personalizado.
sourceOfTruth:
  skills:
    - databricks-genie-agents
  docs:
    - /docs/appkit/v0/plugins/genie
    - https://docs.databricks.com/aws/en/genie-agents/
---

# Genie Agents \{#genie-agents\}

Ofereça aos seus usuários uma caixa de chat que consulta os seus dados. Sem text-to-SQL, sem mapeamento de esquemas, sem LLM personalizado. Um **Genie Agent** (antes chamado de Genie space) é uma interface de linguagem natural do Databricks sobre tabelas do Unity Catalog: conjuntos de dados curados, mais um repositório de conhecimento (sinônimos, exemplos de SQL, descrições de colunas), mais um sistema de IA composto que converte perguntas em SQL. Seu app AppKit faz essa integração com um plugin no servidor e um componente na página.

Para testar um Genie Agent no workspace antes de incorporá-lo, consulte [Usar um Genie Agent](https://docs.databricks.com/aws/en/genie-agents/talk-to-genie). Para criar ou gerenciar um a partir do seu agente de código, use a agent skill [`databricks-genie-agents`](/docs/tools/ai-tools/agent-skills).

:::note[Genie Agents na família Genie]

Genie é uma família de produtos Databricks: Genie One, Genie Agents e Genie Code. Esta página trata dos Genie Agents, a interface de linguagem natural sobre as suas tabelas do Unity Catalog, e de como incorporar um deles em um app AppKit. Para os outros produtos, consulte a [visão geral do Genie](https://docs.databricks.com/aws/en/genie/).

:::

## Pré-requisitos \{#prerequisites\}

- Databricks CLI `v1.0.0+` com um [perfil autenticado](/docs/tools/databricks-cli#authenticate).
- Um app AppKit em execução. Consulte o [Início rápido de Apps](/docs/apps/quickstart).
- Um Genie Agent configurado sobre tabelas do Unity Catalog. Consulte [Create and manage a Genie Agent](https://docs.databricks.com/aws/en/genie-agents/set-up) para fazer a configuração.

  Anexe o agente como recurso na configuração do app (interface ou CLI) com a opção **Can run** selecionada; assim, o Databricks concede essa permissão ao service principal do seu app. Em seguida, o `app.yaml` vincula o recurso a uma variável de ambiente. As permissões do usuário final são abordadas [abaixo](#permissions-and-data-access).

## Por que Genie \{#why-genie\}

Da pergunta ao resultado, o Genie:

- **Entende seu esquema** a partir de tabelas do Unity Catalog, sinônimos, exemplos de SQL e descrições de colunas.
- **Gera SQL** a partir de perguntas em linguagem natural, pedindo esclarecimentos quando o prompt é ambíguo.
- **Executa a consulta** no seu warehouse e retorna resultados tabulares prontos para renderizar.

O [plugin `genie`](/docs/appkit/v0/plugins/genie) conecta tudo isso à sua interface de chat, com streaming via SSE, autenticação e replay de conversas já resolvidos.

## Conecte o plugin \{#wire-the-plugin\}

Registre o plugin com um ou mais aliases de space. As chaves de alias se tornam a prop `alias` no componente de frontend.

```typescript title="server/server.ts"
import { createApp, genie, server } from "@databricks/appkit";

await createApp({
  plugins: [
    server(),
    genie({
      spaces: {
        sales: process.env.SALES_GENIE_SPACE_ID!,
      },
    }),
  ],
});
```

Vincule cada alias a um recurso Genie Agent no `app.yaml`:

```yaml title="app.yaml"
env:
  - name: SALES_GENIE_SPACE_ID
    valueFrom: genie-space
```

O runtime do Databricks Apps injeta o ID do space do recurso na variável de ambiente. Encontre o ID do seu space na aba **Settings** da página do Genie Agent no seu workspace.

Para um app com um único agente, dispense totalmente a configuração `spaces` e vincule a variável de ambiente padrão do plugin:

```yaml title="app.yaml"
env:
  - name: DATABRICKS_GENIE_SPACE_ID
    valueFrom: genie-space
```

Se nenhum `spaces` for informado, o plugin lê `DATABRICKS_GENIE_SPACE_ID` e o registra sob o alias `default`.


## Renderizar o componente de chat \{#render-the-chat-component\}

```tsx title="client/src/pages/ChatPage.tsx"
import { GenieChat } from "@databricks/appkit-ui/react";

export function ChatPage() {
  return (
    <div style={{ height: 600 }}>
      <GenieChat alias="sales" />
    </div>
  );
}
```

A prop `alias` deve corresponder a uma chave na configuração `spaces` do servidor. O `<GenieChat>` ocupa todo o espaço do elemento pai, portanto coloque-o em um contêiner de altura fixa, caso contrário ele ficará com altura zero. O componente renderiza as mensagens, lida com o streaming, persiste o ID da conversa na URL e recarrega o histórico ao atualizar a página. Consulte a [referência do GenieChat](/docs/appkit/v0/api/appkit-ui/genie/GenieChat) para ver a lista completa de props.


## Interface personalizada com `useGenieChat` \{#custom-ui-with-usegeniechat\}

Para uma interface de chat personalizada, use o hook diretamente. Ele retorna o mesmo fluxo de mensagens, além do estado do ciclo de vida da requisição.

```tsx title="client/src/pages/CustomChat.tsx"
import { useGenieChat } from "@databricks/appkit-ui/react";

export function CustomChat() {
  const { messages, status, sendMessage, reset } = useGenieChat({
    alias: "sales",
  });

  return (
    <>
      {messages.map((msg) => (
        <div key={msg.id} data-role={msg.role}>
          {msg.content}
        </div>
      ))}
      <button
        onClick={() => sendMessage("What were total sales last quarter?")}
        disabled={status === "streaming"}
      >
        Ask
      </button>
      <button onClick={reset}>New conversation</button>
    </>
  );
}
```

`status` alterna entre `idle`, `streaming`, `loading-history`, `loading-older` e `error`. Use-o para controlar os estados de carregamento na sua interface. O hook também retorna `error`, `conversationId` e utilitários de paginação (`hasPreviousPage`, `isFetchingPreviousPage`, `fetchPreviousPage`). Consulte a [referência do plugin Genie do AppKit](/docs/appkit/v0/plugins/genie) para ver o tipo de retorno completo e a [API de conversas do Genie](https://docs.databricks.com/aws/en/genie-agents/conversation-api) para conhecer a API REST subjacente.


## Múltiplos spaces \{#multiple-spaces\}

Registre mais de um space para que seus usuários possam alternar entre domínios — por exemplo, um space de vendas e um space de suporte no mesmo aplicativo.

```typescript title="server/server.ts"
genie({
  spaces: {
    sales: process.env.SALES_GENIE_SPACE_ID!,
    support: process.env.SUPPORT_GENIE_SPACE_ID!,
  },
}),
```

Vincule cada ID a um recurso separado no `app.yaml`. Consulte o template [Genie Multi-Agent Selector](/templates/genie-multi-space) para ver uma UI funcional com alternância de agentes, limpeza de conversas e sincronização de URL.


## Permissões e acesso a dados \{#permissions-and-data-access\}

O plugin `genie` chama a API do Genie em nome do usuário autenticado. Tanto o service principal do app quanto cada usuário final precisam de acesso para que uma requisição seja bem-sucedida:

- **Service principal do app**: `CAN RUN` no Genie Agent, concedido quando você anexa o agente como recurso do app (pela interface ou pela CLI) com **Can run** selecionado. As permissões sobre os dados subjacentes não são provisionadas automaticamente: conceda ao service principal `USE CATALOG`, `USE SCHEMA` e `SELECT` nas tabelas do Unity Catalog separadamente. Consulte [Add a Genie Agent resource to an app](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/genie).
- **Usuários finais**: acesso ao Genie Agent (compartilhado diretamente com eles ou por meio de um grupo) e `SELECT` nas mesmas tabelas. Se o usuário não tiver acesso, a chamada retorna 403. Você não precisa escrever a verificação de permissão.

## Próximos passos \{#where-to-next\}

Experimente o [Genie Analytics App](/templates/genie-analytics-app) para ver uma configuração completa e já integrada, ou explore os [endpoints de agentes personalizados](/docs/agents/custom-agents) para Knowledge Assistants e Supervisor Agents.