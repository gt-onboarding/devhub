Este modelo demonstra uma ferramenta interna de CRUD simples construída no Databricks: um rastreador de assinaturas SaaS em que as equipes registram as ferramentas que usam, quem é responsável por cada assinatura, quanto ela custa e quando é renovada. Um Genie Agent oferece análises self-service sobre os dados das assinaturas.

### Fluxo de dados \{#data-flow\}

Todos os dados de assinaturas ficam em uma única tabela do Lakebase Postgres e são entregues diretamente ao app:

1. O **Lakebase Postgres** armazena a tabela `saas_tracker.subscriptions` com nome, fornecedor, custo, ciclo de cobrança, responsável, status e datas de renovação.
2. O **SaaS Tracker App** (Databricks App) lê e grava assinaturas por meio de rotas de API Express apoiadas pelo Lakebase.
3. **Queries no SQL warehouse** alimentam o dashboard de análises (visão geral de gastos, gastos por categoria).
4. Um **Genie Agent** configurado sobre a tabela de assinaturas permite que os usuários façam perguntas em linguagem natural sobre gastos, responsáveis e renovações.

### O que adaptar \{#what-to-adapt\}

O setup e o provisionamento estão documentados no **`README.md`** do repositório.

Para personalizar este modelo:

* **Lakebase**: aponte o `databricks.yml` do app para o seu próprio projeto, branch e banco de dados Lakebase.
* **SQL warehouse**: defina o ID do warehouse usado nas queries de análise.
* **Genie Agent**: crie um Genie Agent sobre a tabela `saas_tracker.subscriptions` e defina o ID do space.
* **Categorias**: ajuste a lista de categorias nas rotas do servidor e no componente de formulário para refletir os departamentos da sua organização.
* **Dados de seed**: o script de seed cria 18 assinaturas de demonstração realistas. Substitua pelos seus próprios dados ou use o formulário de adição do app.