---
title: O que é o Lakebase Postgres?
sidebar_label: Visão geral
description: O Lakebase Postgres é o Postgres gerenciado dentro do Databricks, colocalizado com o seu Lakehouse. Armazenamento OLTP com branching instantâneo e autoscaling.
sourceOfTruth:
  skills:
    - databricks-lakebase
  docs:
    - /docs/appkit/v0/plugins/lakebase
    - https://docs.databricks.com/aws/en/oltp/
---

# O que é o Lakebase Postgres? \{#what-is-lakebase-postgres\}

O Lakebase Postgres é um PostgreSQL gerenciado que roda dentro do seu workspace do Databricks, colocalizado com os dados e serviços do workspace.

Use-o para os dados que seus apps gravam e leem ativamente com baixa latência: estado do usuário, sessões, histórico de conversas e logs armazenados junto aos seus dados analíticos no Lakehouse.

Esta página traz a visão do AppKit sobre o Lakebase. Para saber mais sobre o Lakebase Postgres em si (projetos, branching, autoscaling, conectividade), consulte a [documentação do Lakebase](https://docs.databricks.com/aws/en/oltp/) ou a agent skill [`databricks-lakebase`](/pt/docs/tools/ai-tools/agent-skills).

## O que o diferencia de executar seu próprio Postgres \{#what-makes-it-different-from-running-your-own-postgres\}

* **Roda dentro do seu workspace**, eliminando peering de VPC, gerenciamento de credenciais entre nuvens e latência de rede.
* **Branching instantâneo** por meio de armazenamento copy-on-write, que cria cópias isoladas do banco de dados em segundos, de forma semelhante às branches do git. As branches compartilham os dados inalterados, por isso são baratas de criar e manter.
* **Escala automaticamente** conforme sua carga de trabalho, aumentando sob carga e reduzindo quando a demanda cai, dentro de um intervalo mínimo/máximo configurado. Sem planejamento de capacidade nem redimensionamento manual.
* **Escala a zero** quando ocioso e retoma na próxima consulta. Sem custo de compute ocioso. O tempo limite de inatividade é de 24 horas por padrão e pode ser definido entre 60 segundos e 7 dias.

## Como o AppKit faz a integração \{#how-appkit-wires-it-up\}

Adicione o plugin `lakebase()` ao `createApp` e o plugin configura um `pg.Pool` com refresh automático do token OAuth:

```typescript
import { createApp, lakebase, server } from "@databricks/appkit";

const AppKit = await createApp({
  plugins: [server(), lakebase()],
});

// Consulta padrão com pg.Pool
const { rows } = await AppKit.lakebase.query("SELECT * FROM app.items");

// Configuração pronta para ORM (Drizzle, Prisma, etc.)
const ormConfig = AppKit.lakebase.getOrmConfig();
```

O plugin cuida automaticamente do refresh do token OAuth e do pool de conexões. Quando implantado, a plataforma injeta os valores de conexão como variáveis de ambiente e o plugin os lê. Não é necessária nenhuma configuração manual. A [referência do plugin `lakebase` do AppKit](/pt/docs/appkit/v0/plugins/lakebase) detalha as opções de configuração do pool e a API completa.

## Quando usar \{#when-to-use-it\}

* Seu aplicativo precisa de leituras e gravações de baixa latência: estado do usuário, sessões, histórico de conversas ou registros transacionais.
* Você está criando agentes de IA que precisam de memória persistente: histórico de conversas, estado do fluxo de trabalho ou resultados de ferramentas entre requisições.
* Você quer branches de banco de dados isolados para desenvolvimento de funcionalidades ou testes de CI.
* Você está sincronizando dados entre sua carga de trabalho OLTP e o [Data Lakehouse](/pt/docs/lakehouse/overview) via change data capture.

## Quando não usar \{#when-not-to-use-it\}

* Análises puras: consultas somente leitura sobre grandes conjuntos de dados pertencem ao Unity Catalog, e não ao Lakebase Postgres.
* Aplicativos sem outras dependências do workspace do Databricks. A vantagem da colocalização deixa de existir, e a autenticação passa a ser responsabilidade sua (o Databricks não injeta credenciais nem renova tokens para aplicativos executados fora do workspace).

## Próximos passos \{#where-to-next\}

[Templates](/pt/templates) são prompts prontos para agentes, organizados por caso de uso. Escolha o que melhor atende às suas necessidades ou consulte o [Guia de início rápido do Lakebase Postgres](/pt/docs/lakebase/quickstart) para ver instruções passo a passo.