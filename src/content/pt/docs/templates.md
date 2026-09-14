---
title: O que são templates?
sidebar_label: O que são templates?
description: Templates são prompts de agente prontos para copiar e colar que guiam seu assistente de programação em uma tarefa de desenvolvimento no Databricks, desde a criação da estrutura de um app completo até a adição de um recurso a um app já existente.
---

# O que são templates? \{#what-are-templates\}

O DevHub inclui uma coleção de [templates](/pt/templates) que ajudam você a montar rapidamente a estrutura inicial de um app Databricks.

Um **template** é simplesmente um prompt de agente — um bloco de texto que você cola no seu assistente de programação (Cursor, Claude Code, Codex ou qualquer agente que rode no seu editor) e que diz a ele exatamente como construir algo no Databricks.

O assistente faz o trabalho de construção: ele faz perguntas para esclarecer pontos, executa a Databricks CLI, escreve código e implanta a aplicação. Você continua no controle das decisões de alto nível, mas não precisa conhecer nem memorizar nenhum comando específico.

## Como usar um template \{#how-to-use-a-template\}

Todo template neste site tem um botão **Copy prompt** no topo.

1. Abra um template em [/templates](/pt/templates) e escolha o que corresponde ao que você quer construir.
2. Clique em **Copy prompt** e cole o conteúdo no seu agente de codificação.
3. O agente lê o prompt, faz as perguntas necessárias (qual workspace, qual catálogo, dados reais ou dados de exemplo, etc.) e então parte para a construção.

## Os tipos \{#the-flavors\}

Os templates estão disponíveis em dois tipos: templates de aplicativos completos (end-to-end) e templates de tarefas.

### Templates de aplicativos completos \{#end-to-end-app-templates\}

O agente cria um aplicativo Databricks completo do zero — incluindo interface, servidor, recursos do Databricks e etapas de implantação. Use-os quando estiver iniciando um projeto novo e quiser um aplicativo funcional que possa adaptar ao seu caso de uso.

Exemplos:

* [App with Lakebase](/pt/templates/app-with-lakebase) — um aplicativo CRUD com Postgres gerenciado.
* [AI Chat App](/pt/templates/ai-chat-app) — um aplicativo de chat com respostas em streaming e histórico de conversas persistente.
* [Vacation Rentals Operations Console](/pt/templates/vacation-rentals) — uma fila de reservas com sinalizadores e notas de agentes no Lakebase, análise de receita via SQL Warehouse e um painel de chat do Genie incorporado.

Alguns templates completos também incluem uma base de código inicial implantável do repositório [app-templates](https://github.com/databricks/app-templates) do Databricks. Nesses casos, o agente a clona como ponto de partida e a adapta aos seus dados, ao seu workspace e ao seu caso de uso.

### Templates de tarefa \{#task-templates\}

O agente executa um trabalho específico em um projeto existente. Use-os quando você já tiver um app Databricks e quiser acrescentar algo a ele.

Exemplos:

* [Onboard Your Coding Agent](/pt/templates/onboard-your-coding-agent) — instale as skills da plataforma Databricks e o Docs MCP Server no seu repositório.
* [Lakebase Data Persistence](/pt/templates/lakebase-data-persistence) — adicione armazenamento Postgres gerenciado a um app já existente.
* [Criar um projeto Lakebase](/pt/templates/lakebase-create-instance) — provisione um projeto Lakebase e colete os valores de conexão.

Os templates de tarefa foram projetados para serem combinados. Vários deles encadeados podem levar você de um repositório vazio a um app implantado — que é exatamente o que os templates de ponta a ponta fazem nos bastidores.

## Próximos passos \{#where-to-go-next\}

* Explore o [catálogo de templates](/pt/templates) completo.
* Conheça em detalhes os serviços da plataforma Databricks que você pode usar para criar seu app: [Databricks Apps](/pt/docs/apps/overview), [Lakebase Postgres](/pt/docs/lakebase/overview), [Agent Bricks](/pt/docs/agents/overview) e o [Data Lakehouse](/pt/docs/lakehouse/overview).