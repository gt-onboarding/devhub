---
title: Docs MCP Server
---

# Docs MCP Server \{#docs-mcp-server\}

O Docs MCP Server do DevHub dá a agentes de programação e assistentes de IDE acesso de leitura a todas as páginas de documentação do DevHub. Os agentes podem descobrir as páginas disponíveis e obter documentos individuais em markdown sem sair do editor.

## Instalação \{#install\}

Adicione o servidor a qualquer agente de programação compatível (Cursor, Claude Code, VS Code, Codex e outros) com um único comando.

Instalação global (no nível do usuário, disponível em todos os projetos):

```bash
npx add-mcp __DEVHUB_SITE_URL__/api/mcp --name devhub-docs -g
```

Instalação a nível de projeto (apenas no diretório atual):

```bash
npx add-mcp __DEVHUB_SITE_URL__/api/mcp --name devhub-docs
```

Para direcionar um agente específico, adicione `-a`:

```bash
npx add-mcp __DEVHUB_SITE_URL__/api/mcp --name devhub-docs -g -a cursor
```

Reinicie seu editor após adicionar o servidor. Alguns editores, como o Cursor, exigem que você acesse a página de configurações do MCP e ative o novo servidor.


## Verifique a conexão \{#verify-the-connection\}

Após a instalação, confirme se o servidor está funcionando:

1. Verifique se `devhub-docs` aparece nas listagens de ferramentas.
   - Exemplo: "Você tem o MCP devhub-docs instalado?"
2. Peça ao seu agente para chamar `list_docs_resources` e confirme se ele retorna um índice da documentação.
   - Exemplo: "Quais documentos estão disponíveis no devhub?"
3. Peça ao seu agente para buscar uma página específica com `get_doc_resource`.
   - Exemplo: "Qual é o conteúdo da página start-here?"

Na prática, você não precisa se preocupar em chamar as ferramentas diretamente. Basta pedir ao agente que faça o trabalho por você, e ele chamará as ferramentas internamente.

## Referência de ferramentas \{#tools-reference\}

O servidor expõe duas ferramentas somente leitura.

### `list_docs_resources` \{#list_docs_resources\}

Lista todas as páginas disponíveis da documentação para desenvolvedores do Databricks. Retorna o índice da documentação em markdown com as URLs e os títulos das páginas.

Sem parâmetros.

```
list_docs_resources()
→ markdown index of all doc pages with slugs and titles
```


### `get_doc_resource` \{#get_doc_resource\}

Obtém uma única página da documentação para desenvolvedores do Databricks em markdown. Use primeiro `list_docs_resources` para descobrir os slugs disponíveis.

| Parâmetro | Tipo   | Obrigatório | Descrição                                                                                                                 |
| --------- | ------ | ----------- | ------------------------------------------------------------------------------------------------------------------------- |
| `slug`    | string | sim         | O slug (caminho) da página de documentação, por exemplo, `start-here`. Use `list_docs_resources` para encontrar os slugs. |

```
get_doc_resource(slug: "start-here")
→ conteúdo markdown completo da página solicitada
```

As páginas que declaram uma fonte da verdade começam com uma breve linha **Source of truth** que indica a(s) agent skill(s) e a documentação canônica a carregar para refletir o comportamento atual do produto.


## Próximos passos \{#where-to-next\}

Com a [Databricks CLI](/docs/tools/databricks-cli), as [agent skills](/docs/tools/ai-tools/agent-skills) e o Docs MCP Server instalados, seu agente de programação tem tudo o que precisa para desenvolver e implantar.

Pronto para começar? Veja como os [templates](/docs/templates) podem ajudar você a fazer o scaffold do seu projeto rapidamente ou vá direto ao ponto e explore o [catálogo de templates](/templates).