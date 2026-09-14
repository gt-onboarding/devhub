Este modelo reúne toda a pilha de desenvolvimento da Databricks em um único aplicativo de dados operacional: um console de suporte com IA em que cada mensagem de cliente é triada automaticamente por um LLM, e os atendentes de suporte revisam, aprovam ou substituem a sugestão a partir de uma ferramenta interna criada sob medida.

### Fluxo de Dados \{#data-flow\}

As interações dos clientes fluem do banco de dados OLTP da sua aplicação (Lakebase Postgres) para o lakehouse via CDC, são enriquecidas por um agente de IA e voltam ao console de suporte por meio de sincronização reversa:

1. As **gravações OLTP** chegam ao Lakebase Postgres (usuários, pedidos, casos de suporte, mensagens).
2. O **Lakebase Change Data Feed (CDF)** replica cada alteração para o Unity Catalog como tabelas de histórico CDC (camada bronze).
3. Um **Lakeflow Spark Declarative Pipeline** transforma o histórico CDC em tabelas silver de estado atual e em visualizações materializadas gold analíticas (receita diária, visão geral do suporte, perfis de usuários, contexto dos casos).
4. Um **Lakeflow Job** é executado a cada minuto, localiza mensagens sem resposta, monta um contexto rico a partir das tabelas gold, chama um LLM por meio de um Model Serving endpoint e mescla as respostas sugeridas em uma tabela Delta.
5. As **synced tables** (sincronização reversa) replicam as tabelas gold de volta para o Lakebase, permitindo leituras de baixa latência.
6. O **Support Console** (Databricks App) lê tanto do OLTP quanto das tabelas gold sincronizadas para apresentar casos, sugestões de IA e análises.

### O que adaptar \{#what-to-adapt\}

O provisionamento (etapas manuais e SQL), o seeding, os deploys das pipelines, a sincronização reversa e o deploy do app estão documentados no **`README.md`** do repositório, junto ao código.

Para adaptar este modelo às suas necessidades:

* **Catálogo**: defina a variável `catalog` no `databricks.yml` de cada pipeline com o nome do seu catálogo no Unity Catalog.
* **Lakebase**: aponte o `databricks.yml` do app para o seu próprio projeto, branch e banco de dados do Lakebase.
* **Tabelas**: o script de seed cria o schema OLTP. Depois do seeding, configure o Change Data Feed para replicar as tabelas do seu schema `public`.
* **Sync Tables**: crie manualmente as quatro configurações de sincronização reversa (consulte o README para ver os mapeamentos exatos das tabelas).
* **Serving Endpoint**: defina a variável `endpoint` com o serving endpoint de modelo de sua preferência.
* **Genie Agent**: crie um Genie Agent sobre suas tabelas gold e defina o `genie_space_id` no bundle do app.