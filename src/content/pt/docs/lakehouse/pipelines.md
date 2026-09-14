---
title: Pipelines do Lakeflow e atualidade dos dados
sidebar_label: Pipelines e atualidade
description: Exiba timestamps que respondem à pergunta "estes dados estão atualizados?" no seu app AppKit. Leia os metadados de atualização de cada tabela e a linha do tempo de atualizações do pipeline por meio do plugin Analytics.
sourceOfTruth:
  skills:
    - databricks-pipelines
  docs:
    - /docs/appkit/v0/plugins/analytics
    - https://docs.databricks.com/aws/en/ldp/
---

# Pipelines do Lakeflow e atualidade dos dados \{#lakeflow-pipelines-and-data-freshness\}

Os Lakeflow Spark Declarative Pipelines (SDP) alimentam as tabelas analíticas que seu app lê. Criar pipelines é uma tarefa de engenharia de dados na qual você, como desenvolvedor AppKit, quase nunca vai mexer. Seu trabalho está no lado da leitura: exibir a saída do pipeline e responder "isso está atualizado o suficiente para ser mostrado?" antes de renderizar.

Sinais em SQL respondem a essa pergunta: metadados de atualização por tabela para visualizações materializadas e tabelas de streaming, além da linha do tempo das atualizações do pipeline. Ambos passam pelo [Analytics plugin](/docs/appkit/v0/plugins/analytics) que você configurou em [Leituras analíticas](/docs/lakehouse/analytical-reads).

O Lakeflow é a suíte de engenharia de dados da Databricks. Como desenvolvedor AppKit, você apenas lê a saída dos pipelines, mas vale conhecer as peças:

- **Lakeflow Connect** para ingestão, com conectores gerenciados que depositam dados no Unity Catalog.
- **Lakeflow Spark Declarative Pipelines** para transformação, escritos em SQL ou Python, produzindo visualizações materializadas e tabelas de streaming.
- **Lakeflow Jobs** para orquestração. Consulte [Lakeflow Jobs](/docs/lakehouse/jobs) para o lado do acionamento pelo app.
- **Lakeflow Designer** para construção visual de pipelines, sem código.

Consulte a [documentação do Lakeflow](https://docs.databricks.com/aws/en/ldp/) para conhecer toda a família de produtos.

## Sinais de atualidade \{#freshness-signals\}

- **Metadados de atualização por tabela**: `DESCRIBE TABLE EXTENDED <name> AS JSON` retorna um bloco `refresh_information` para visualizações materializadas e tabelas de streaming. O bloco contém `last_refreshed_at`, `last_refresh_type`, `latest_refresh_status`, `latest_refresh_link` e `refresh_schedule`. Consulte [DESCRIBE TABLE](https://docs.databricks.com/aws/en/sql/language-manual/sql-ref-syntax-aux-describe-table) para ver o esquema completo da saída.
- **Linha do tempo de atualizações do pipeline**: `system.lakeflow.pipeline_update_timeline` registra cada atualização de pipeline com `pipeline_id`, `update_id`, `period_start_time`, `period_end_time`, `result_state` (um entre `COMPLETED`, `FAILED`, `CANCELED`) e detalhes do gatilho. Filtre por `pipeline_id` e `result_state = 'COMPLETED'` para encontrar a atualização bem-sucedida mais recente do pipeline ao qual a tabela pertence. Consulte a [referência de tabelas do sistema](https://docs.databricks.com/aws/en/admin/system-tables/jobs#pipeline-update-timeline) para ver a lista completa de colunas.

Para diagnósticos mais aprofundados (status por fluxo, resultados de expectativas, eventos de linhagem), use o [log de eventos do pipeline](https://docs.databricks.com/aws/en/ldp/monitor-event-logs) por meio da função com valor de tabela `event_log()`. O log de eventos é o lugar certo para perguntas do tipo "por que esta atualização falhou", e não "estes dados estão atualizados o suficiente para serem exibidos".

## Uma consulta de badge &quot;Última atualização&quot; \{#a-last-updated-badge-query\}

Coloque isto em `config/queries/`. Ela roda pelo Analytics plugin como qualquer outro arquivo SQL.

```sql title="config/queries/last_pipeline_update.obo.sql"
-- @param pipelineId STRING
SELECT period_end_time, result_state
FROM system.lakeflow.pipeline_update_timeline
WHERE pipeline_id = :pipelineId
  AND result_state = 'COMPLETED'
ORDER BY period_end_time DESC
LIMIT 1;
```

Chame o hook no React com o ID do pipeline:

```tsx
import { useMemo } from "react";
import { sql } from "@databricks/appkit-ui/js";
import { useAnalyticsQuery } from "@databricks/appkit-ui/react";

const params = useMemo(
  () => ({ pipelineId: sql.string("ec2a0ff4-d2a5-4c8c-bf1d-d9f12f10e749") }),
  [],
);
const { data } = useAnalyticsQuery("last_pipeline_update", params);
```

O nome de arquivo `.obo.sql` executa a consulta como o usuário autenticado. Se o service principal do seu app tiver `SELECT` em `system.lakeflow.pipeline_update_timeline`, remova o `.obo` e a consulta será executada como o app. Consulte [Escrever arquivos SQL](/docs/lakehouse/analytical-reads#author-sql-files) para ver a regra completa de nomenclatura de arquivos.


## Disparar uma atualização a partir do app \{#triggering-a-refresh-from-the-app\}

Não existe um plugin dedicado de Pipelines no AppKit. Chame o SDK diretamente do seu handler com `w.pipelines.startUpdate({ pipelineId })` ou encapsule o pipeline em um [Lakeflow Job](/docs/lakehouse/jobs) e use o Jobs plugin.

## Próximos passos \{#where-to-next\}

Experimente [Medallion Architecture from CDC History Tables](/templates/medallion-architecture-from-cdc) para conhecer o pipeline SDP canônico que gera essas tabelas, ou [Operational Data Analytics](/templates/operational-data-analytics) para o padrão completo de UC + CDC + medalhão.