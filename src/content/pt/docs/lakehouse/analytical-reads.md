---
title: Ler tabelas do Unity Catalog
sidebar_label: Leituras analíticas
description: Leia tabelas governadas do Unity Catalog a partir da sua app AppKit com o Analytics plugin. Arquivos SQL, consultas on-behalf-of-user e vinculação de recurso de SQL warehouse.
sourceOfTruth:
  skills:
    - databricks-dbsql
    - databricks-unity-catalog
  docs:
    - /docs/appkit/v0/plugins/analytics
    - https://docs.databricks.com/aws/en/sql/
    - https://docs.databricks.com/aws/en/data-governance/unity-catalog/
---

# Ler tabelas do Unity Catalog \{#read-unity-catalog-tables\}

Para executar consultas analíticas em tabelas no Databricks a partir do seu app AppKit, você precisa de um SQL warehouse (o compute SQL do Databricks). O [Analytics plugin](/docs/appkit/v0/plugins/analytics) conecta seu handler a um: os arquivos SQL ficam em `config/queries/`, o warehouse os executa e as linhas tipadas são retornadas. Seu handler não verifica permissões.

As tabelas consultadas pelo warehouse são governadas pelo Unity Catalog (UC). O UC controla o namespace de três níveis (`catalog.schema.object`) e aplica grants, filtros de linha, máscaras de coluna e políticas ABAC (controle de acesso baseado em atributos) a cada acesso. Além das tabelas, o UC também governa views, visualizações materializadas, volumes, modelos, índices de vector search e funções registradas.

## Pré-requisitos \{#prerequisites\}

- Databricks CLI `v1.0.0+` com um [perfil autenticado](/docs/tools/databricks-cli#authenticate).
- Um app AppKit em execução. Consulte o [guia rápido de Apps](/docs/apps/quickstart).
- Um SQL warehouse declarado como recurso do app no `databricks.yml`. O service principal do seu app recebe `CAN_USE` automaticamente ao vincular o recurso. As permissões de usuário final são tratadas [abaixo](#where-403s-come-from).

## O que o Analytics plugin lê \{#what-the-analytics-plugin-reads\}

Todos os objetos do UC ficam em um namespace `catalog.schema.object`. Os objetos consultados por este plugin são:

- **Tabelas** (Delta e Iceberg).
- **Views** e **visualizações materializadas**.
- **Streaming tables**.
- **Funções** chamadas como `SELECT my_catalog.my_schema.my_function(...)`.

Os demais objetos do UC utilizam outros plugins. Volumes (armazenamento de arquivos) passam pelo [plugin Files](/docs/appkit/v0/plugins/files). A lista completa de objetos do UC está em [Securable objects](https://docs.databricks.com/aws/en/data-governance/unity-catalog/securable-objects).

## Conecte o Analytics plugin \{#wire-the-analytics-plugin\}

Registre o plugin em `createApp`. Ele expõe os endpoints do Analytics e lê as consultas de `config/queries/`, executando-as no SQL warehouse vinculado em `app.yaml`.

```typescript title="server/server.ts"
import { analytics, createApp, server } from "@databricks/appkit";

await createApp({
  plugins: [server(), analytics({})],
});
```

Vincule o SQL warehouse no `app.yaml` para que a plataforma defina `DATABRICKS_WAREHOUSE_ID` na inicialização:

```yaml title="app.yaml"
env:
  - name: DATABRICKS_WAREHOUSE_ID
    valueFrom: sql-warehouse
```

O recurso correspondente fica em `databricks.yml`. Consulte [Configuração do app](/docs/apps/configuration#resources) para ver a lista completa de recursos e as chaves `valueFrom`.


## Escreva os arquivos SQL \{#author-sql-files\}

Coloque os arquivos `.sql` em `config/queries/`. O nome do arquivo sem a extensão `.sql` se torna a chave da consulta.

```sql title="config/queries/spend_summary.sql"
-- @param startDate DATE
-- @param endDate DATE
SELECT date_trunc('day', usage_date) AS day, SUM(usage_quantity) AS qty
FROM system.billing.usage
WHERE usage_date BETWEEN :startDate AND :endDate
GROUP BY 1
ORDER BY 1;
```

O contexto de execução é definido pelo nome do arquivo:

* `spend_summary.sql` é executado como o **service principal do app**. O cache é compartilhado entre os usuários.
* `spend_summary.obo.sql` é executado como o **usuário autenticado**. O cache é individual por usuário. O Unity Catalog aplica os grants, os filtros de linha, as máscaras de coluna e as políticas ABAC desse usuário.

Para conhecer a API completa do plugin, incluindo tipos de parâmetros e streaming Arrow, consulte a [referência do Analytics plugin](/docs/appkit/v0/plugins/analytics).


## Renderizar em React com `useAnalyticsQuery` \{#render-in-react-with-useanalyticsquery\}

```tsx title="client/src/SpendTable.tsx"
import { useMemo } from "react";
import { sql } from "@databricks/appkit-ui/js";
import { useAnalyticsQuery } from "@databricks/appkit-ui/react";

export function SpendTable() {
  const params = useMemo(
    () => ({
      startDate: sql.date("2025-01-01"),
      endDate: sql.date("2025-12-31"),
    }),
    [],
  );

  const { data, loading, error } = useAnalyticsQuery("spend_summary", params);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;
  return (
    <ul>
      {data?.map((row) => (
        <li key={row.day}>
          {row.day}: {row.qty}
        </li>
      ))}
    </ul>
  );
}
```

:::important[Envolva os parâmetros em useMemo]
O `useAnalyticsQuery` refaz a busca sempre que a referência dos seus parâmetros muda. Um objeto inline cria uma nova referência em cada renderização, o que causa um loop infinito. Envolva os parâmetros em `useMemo`.
:::


## De onde vêm os erros 403 \{#where-403s-come-from\}

A identidade associada a cada consulta é definida pelo nome do arquivo:

- **Consultas com service principal** (`*.sql`) usam o service principal do app. O SP precisa de `SELECT` nas tabelas subjacentes. Erros de permissão retornam `403` do warehouse.
- **Consultas on-behalf-of-user** (`*.obo.sql`) usam o usuário autenticado. O UC aplica os grants desse usuário automaticamente. Se o usuário não tiver `SELECT`, ou se um filtro de linha ou uma máscara de coluna ocultar os dados, a chamada retorna `403` ou devolve menos linhas. Você não precisa escrever a verificação de permissão.

:::note[A autorização on-behalf-of-user deve estar habilitada]

Um administrador do workspace precisa habilitar a autorização on-behalf-of-user antes que seja possível adicionar escopos ao seu app. Consulte [App authorization](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/auth) para ver os detalhes da plataforma.

:::

## Lakehouse Federation \{#lakehouse-federation\}

O Lakehouse Federation faz com que fontes externas (Snowflake, BigQuery, Oracle, Redshift) apareçam como catálogos do UC. Depois de registradas, elas são tratadas como qualquer outra tabela do UC pelo Analytics plugin: mesma referência `catalog.schema.table`, mesmo arquivo SQL, mesmo OBO. O warehouse aplica filtros e agregações diretamente na fonte externa (pushdown) sempre que possível e lê os dados restantes no momento da consulta, sem persisti-los no UC. Consulte [Lakehouse Federation](https://docs.databricks.com/aws/en/query-federation/) para ver a lista de fontes, a configuração e a cobertura de pushdown por fonte.

## Consultas em linguagem natural \{#natural-language-queries\}

Para perguntas e respostas em linguagem natural sobre tabelas do UC (conjuntos de dados curados, além de um repositório de conhecimento e de um sistema de IA composto que converte perguntas em SQL), use o [Genie](/docs/agents/genie). Para ver uma configuração funcional, consulte o template [Genie Conversational Analytics](/templates/genie-conversational-analytics). O plugin do Genie está na seção Agent Bricks porque se trata de uma integração de agente, e não de SQL.

## Próximos passos \{#where-to-next\}

Experimente [Set Up Unity Catalog with External Storage](/templates/unity-catalog-setup) para provisionar um catálogo ou [Volume File Manager](/templates/volume-file-upload) para adicionar UC Volumes ao seu app. Depois, explore [Lakeflow Jobs](/docs/lakehouse/jobs) para disparar execuções ou [Pipelines and freshness](/docs/lakehouse/pipelines) para obter sinais de «última atualização».