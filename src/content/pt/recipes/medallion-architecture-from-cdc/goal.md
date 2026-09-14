Ao final, você terá:

* Uma camada bronze fornecida pelas tabelas de histórico do Change Data Feed do Lakebase upstream (entrada desta receita)
* Uma camada silver com visualizações materializadas de estado atual e sem duplicatas para cada entidade
* Uma camada gold com agregações e métricas de negócio como visualizações materializadas
* Um Lakeflow Spark Declarative Pipeline agendado, atualizando as camadas silver e gold de forma incremental
* Todas as camadas disponíveis para consulta como tabelas do Unity Catalog via SQL, Spark, ferramentas de BI e Genie