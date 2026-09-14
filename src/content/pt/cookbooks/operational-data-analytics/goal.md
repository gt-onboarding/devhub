Um pipeline completo de análise de dados operacionais: os dados fluem de um banco de dados OLTP (Lakebase Postgres) via replicação CDC para o Unity Catalog, são transformados em uma arquitetura medalhão (camadas bronze/silver/gold) e ficam prontos para dashboards e consumidores downstream.

### Componentes \{#components\}

1. **Configuração do Unity Catalog** — configure o Unity Catalog com armazenamento externo no S3 para o catálogo e o schema de destino.
2. **Criar um projeto Lakebase** — provisione um projeto de managed Postgres como fonte OLTP.
3. **Lakebase Change Data Feed (CDF)** — habilite a replicação contínua das tabelas do Lakebase para tabelas de histórico Delta no Unity Catalog.
4. **Arquitetura de medalhão a partir do CDC** — construa as camadas silver (estado atual) e gold (analítica) a partir das tabelas de histórico do CDC usando Lakeflow Spark Declarative Pipelines.