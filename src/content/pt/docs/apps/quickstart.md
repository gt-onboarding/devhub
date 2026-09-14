---
title: Início rápido
sourceOfTruth:
  skills:
    - databricks-apps
  docs:
    - /docs/appkit/v0
    - https://docs.databricks.com/aws/en/dev-tools/databricks-apps/
---

# Início rápido \{#quickstart\}

## Pré-requisitos \{#prerequisites\}

- Databricks CLI `v1.0.0+` com um [perfil autenticado](/docs/tools/databricks-cli#authenticate)
- Node.js 22+ (os apps do AppKit são em Node/TypeScript)
- Workspace do Databricks com o Apps habilitado

## Caminho dos templates \{#template-path\}

Os [templates](/templates) são prompts prontos para agentes, organizados por caso de uso. Escolha o que melhor se encaixa, copie-o para o seu assistente de programação com IA e o assistente cuida do scaffold, da seleção de plugins e da implantação.

Pontos de partida comuns:

| Template                                                                          | Ideal para                                                                  |
| --------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| [Set Up Your Local Dev Environment](/templates/set-up-your-local-dev-environment) | Instalar a CLI, autenticar e verificar o workspace                          |
| [Spin Up a Databricks App](/templates/spin-up-databricks-app)                     | Criar o scaffold de um novo app AppKit, executá-lo localmente e implantá-lo |
| [Onboard Your Coding Agent](/templates/onboard-your-coding-agent)                 | Instalar habilidades de agente e conectar o Docs MCP Server do DevHub       |
| [AI Chat App](/templates/ai-chat-app)                                             | IA conversacional, chatbots e assistentes                                   |
| [App with Lakebase](/templates/app-with-lakebase)                                 | Apps CRUD com armazenamento persistente                                     |

O [catálogo de templates](/templates) traz a lista completa, incluindo [Lakebase Postgres](/docs/lakebase/quickstart), [Genie Agents](/docs/agents/genie), [Unity AI Gateway](/docs/agents/ai-gateway) e [Agent Bricks](/docs/agents/overview).

Dê ao seu assistente de IA o contexto da plataforma Databricks instalando as [habilidades de agente](/docs/tools/ai-tools/agent-skills) antes de copiar o template:

```bash
databricks aitools install
```


## Caminho manual \{#manual-path\}

Sem um template, o `databricks apps init` gera um projeto AppKit funcional. Veja o que `--features lakebase` produz (você não precisa escrever isso):

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

Faça o scaffold, execute localmente e implante:

```bash
databricks apps init --name my-app --features lakebase   # gera o projeto acima
cd my-app && npm install && npm run dev                  # executa localmente
databricks apps deploy                                   # implanta no seu workspace
```

Após o deploy, a CLI exibe a URL do seu app no workspace.

Para gerar o scaffold com plugins específicos, passe `--features` com uma lista separada por vírgulas. Execute `databricks apps manifest` para ver todos os plugins disponíveis e os campos de recurso exigidos por cada um.


## Próximos passos \{#where-to-next\}

Para o fluxo completo de desenvolvimento local, as flags de implantação e a configuração de plugins, consulte [Desenvolvimento de apps](/docs/apps/development).