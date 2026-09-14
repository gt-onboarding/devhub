Um Databricks App com Lakebase Postgres para armazenamento persistente de dados. O app inclui setup de schema, rotas de API com CRUD completo e faz deploy na plataforma Databricks Apps.

### Componentes \{#components\}

1. **Criar um projeto Lakebase** — provisione um projeto de managed Postgres com um endpoint e um banco de dados e colete os valores de conexão.
2. **Lakebase Data Persistence** — adicione o plugin do Lakebase ao seu app com inicialização de schema, rotas CRUD e padrões de acesso a dados.