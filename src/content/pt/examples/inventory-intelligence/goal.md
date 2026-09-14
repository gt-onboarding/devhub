Este modelo cria um sistema completo de gestão de estoque para o varejo na stack do Databricks: um app em React no qual gerentes de loja acompanham a saúde do estoque, revisam recomendações de reposição geradas por IA e aprovam pedidos de compra — tudo isso apoiado por um pipeline medalhão em tempo real e por um job de previsão de demanda plugável.

### Fluxo de Dados \{#data-flow\}

Os dados de vendas e estoque fluem do Lakebase Postgres pelo lakehouse, são enriquecidos por um modelo de previsão de demanda e voltam ao app por meio de sincronização reversa:

1. **Gravações OLTP** chegam ao Lakebase Postgres (lojas, produtos, níveis de estoque, transações de vendas, pedidos de reposição).
2. O **Lakebase Change Data Feed (CDF)** replica cada alteração no Unity Catalog como tabelas de histórico CDC (camada bronze).
3. Um **Lakeflow Spark Declarative Pipeline** transforma o histórico CDC em tabelas silver de estado atual e visualizações materializadas gold (visão geral do estoque, alertas de estoque baixo, velocidade de vendas).
4. Um **Lakeflow Job** é executado de forma agendada, carrega o histórico de vendas silver e roda um modelo de previsão de demanda plugável para gerar previsões de unidades para 30 dias e recomendações de reposição em uma tabela Delta gold.
5. As **Sync Tables** (sincronização reversa) replicam as tabelas gold de volta ao Lakebase para leituras de baixa latência.
6. O **Inventory Intelligence App** (Databricks App) lê tanto das tabelas OLTP quanto das tabelas gold sincronizadas para exibir dashboards, detalhamentos por loja, uma fila de reposição e análises opcionais com Genie.

### Design \{#design\}

O app deve ter um **design bonito e refinado** — tipografia limpa, espaçamento consistente e uma estética profissional de varejo. Use componentes do shadcn/ui como base, Tailwind para toda a estilização e as cores da marca em toda a interface. Os dashboards devem transmitir riqueza de dados sem poluição visual; a fila de reposição deve tornar os fluxos de aprovação algo simples e sem esforço.

### O que adaptar \{#what-to-adapt\}

O provisionamento (schemas do Unity Catalog, REPLICA IDENTITY do Lakebase), o seeding, os deploys de pipeline, o reverse sync e o deploy do app estão documentados no **`README.md`** do repositório, junto com o código.

Para adaptar este modelo ao seu caso:

* **Catálogo**: defina a variável `catalog` no `databricks.yml` de cada pipeline com o nome do seu catálogo do Unity Catalog.
* **Lakebase**: aponte o `databricks.yml` do app para o seu próprio projeto, branch e banco de dados do Lakebase.
* **Tabelas**: o script de seed cria o schema OLTP com 5 lojas, 25 produtos e 90 dias de histórico de vendas. Após o seeding, configure o Change Data Feed para replicar as tabelas do schema `inventory`.
* **Sync Tables**: crie manualmente as três configurações de reverse sync (consulte o README para ver os mapeamentos exatos das tabelas).
* **Modelo de previsão**: defina a variável `forecast_model` no pipeline de previsão de demanda como `weighted_moving_average` (padrão), `exponential_smoothing`, `prophet` ou `model_serving`.
* **Genie Agent**: crie um Genie Agent sobre suas tabelas gold e defina o `genie_space_id` no bundle do app para ativar a aba Analytics.