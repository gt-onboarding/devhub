---
title: O que é o Data Lakehouse?
sidebar_label: Visão geral
description: A camada de dados da Databricks Data Intelligence Platform. Tabelas analíticas governadas no Unity Catalog, alimentadas pelo Lakeflow. Documentação complementar para apps do AppKit.
sourceOfTruth:
  skills:
    - databricks-dbsql
    - databricks-jobs
    - databricks-pipelines
  docs:
    - /docs/appkit/v0/plugins/analytics
    - /docs/appkit/v0/plugins/jobs
    - https://docs.databricks.com/aws/en/lakehouse/
---

# O que é o Data Lakehouse? \{#what-is-the-data-lakehouse\}

O Data Lakehouse é a camada analítica do seu workspace Databricks: tabelas e views governadas pelo Unity Catalog e populadas pelo Lakeflow. O Lakeflow é o conjunto de serviços de engenharia de dados da Databricks que abrange ingestão, orquestração e gerenciamento de pipelines. A partir de um app AppKit, você lê essas tabelas, dispara Lakeflow Jobs e exibe os carimbos de data/hora de &quot;última atualização&quot; dos pipelines que as populam.

O [Analytics plugin](/pt/docs/appkit/v0/plugins/analytics) cuida das leituras no SQL warehouse (consulte [Leituras analíticas](/pt/docs/lakehouse/analytical-reads) e [Pipelines e atualidade dos dados](/pt/docs/lakehouse/pipelines)). O [Jobs plugin](/pt/docs/appkit/v0/plugins/jobs) cuida do disparo de execuções e do acompanhamento do progresso (consulte [Lakeflow Jobs](/pt/docs/lakehouse/jobs)).

## Quando usar o Data Lakehouse \{#when-to-use-the-data-lakehouse\}

* Você precisa ler dados analíticos curados: receita, clientes, eventos, resultados de modelos.
* Você exibe agregações no estilo de dashboard ou visualizações em lista sobre milhões de linhas.
* Você dispara retreinamento de modelos, ETL ou um backfill demorado de forma assíncrona a partir de uma ação do usuário.

## Quando não usar \{#when-not-to-use-it\}

* **Leituras com latência de milissegundos em uma requisição do usuário**, como typeahead ou autocompletar. Use o [Lakebase Postgres](/pt/docs/lakebase/overview) diretamente ou replique uma tabela do UC no Lakebase como uma synced table.
* **Gravações transacionais a partir do seu app** (pedidos, sessões, logs de auditoria). Use o [Lakebase Postgres](/pt/docs/lakebase/overview).
* **Perguntas e respostas em linguagem natural sobre tabelas governadas**. Use o [Genie](/pt/docs/agents/genie).

Você também não cria pipelines, não configura o Spark nem dimensiona clusters. Essas são tarefas de engenharia de dados, realizadas no workspace do Databricks ou por meio dos [Declarative Automation Bundles](https://docs.databricks.com/aws/en/dev-tools/bundles/).

## Escolha um template para começar \{#pick-a-template-to-start-from\}

Cada um reúne as integrações das páginas acima em um padrão funcional.

| Você quer...                                                          | Template                                                            |
| --------------------------------------------------------------------- | ------------------------------------------------------------------- |
| Replicar uma tabela do UC no Lakebase para leituras de baixa latência | [Sync Tables (Autoscaling)](/pt/templates/sync-tables-autoscaling)     |
| Montar o pipeline completo de UC + Change Data Feed do Lakebase + medalhão | [Operational Data Analytics](/pt/templates/operational-data-analytics) |

## Próximos passos \{#where-to-next\}

* [Leituras analíticas](/pt/docs/lakehouse/analytical-reads) com o plugin Analytics, arquivos SQL e consultas on-behalf-of-user.
* [Lakeflow Jobs](/pt/docs/lakehouse/jobs) para o plugin Jobs, `runNow` e progresso via SSE.
* [Pipelines e atualidade](/pt/docs/lakehouse/pipelines) para sinais de atualidade por meio do plugin Analytics.