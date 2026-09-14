Conclua primeiro estes modelos de pré-requisito:

* [Set Up Your Local Dev Environment](/templates/set-up-your-local-dev-environment) — instale o Databricks CLI e autentique um perfil.
* [Query Foundation Model Endpoints](/templates/foundation-models-api) — confirme que seu workspace disponibiliza um endpoint de chat de modelo de fundação hospedado no Databricks.

Em seguida, verifique se estes recursos do workspace do Databricks estão habilitados. Se alguma verificação falhar, peça ao administrador do seu workspace que habilite o recurso.

* **Um endpoint de chat compatível com OpenAI no Model Serving.** Execute `databricks serving-endpoints list --profile <PROFILE>` e confirme que pelo menos um endpoint de chat compatível com OpenAI aparece na lista (por exemplo, `databricks-gpt-5-4-mini`, `databricks-meta-llama-3-3-70b-instruct` ou `databricks-claude-sonnet-4-6`). A disponibilidade de endpoints varia conforme o workspace e a região; anote aquele que você pretende definir como `DATABRICKS_ENDPOINT`.
* **Databricks Apps habilitado.** Execute `databricks apps list --profile <PROFILE>` e confirme que o comando é executado com sucesso (uma lista vazia não é problema). Um erro de permissão ou `not enabled` indica que o Apps não está disponível para essa identidade neste workspace.