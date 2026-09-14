Suivez d&#39;abord ces modèles prérequis :

* [Configurer votre environnement de développement local](/templates/set-up-your-local-dev-environment) — installez la CLI Databricks et authentifiez un profil.
* [Interroger les endpoints de foundation models](/templates/foundation-models-api) — vérifiez que votre workspace expose un endpoint de chat de foundation model hébergé par Databricks.

Vérifiez ensuite que les fonctionnalités suivantes sont activées dans votre workspace Databricks. Si l&#39;une des vérifications échoue, demandez à l&#39;administrateur de votre workspace d&#39;activer la fonctionnalité concernée.

* **Un endpoint de chat compatible OpenAI dans Model Serving.** Exécutez `databricks serving-endpoints list --profile <PROFILE>` et vérifiez qu&#39;au moins un endpoint de chat compatible OpenAI apparaît dans la liste (par exemple `databricks-gpt-5-4-mini`, `databricks-meta-llama-3-3-70b-instruct` ou `databricks-claude-sonnet-4-6`). La disponibilité des endpoints varie selon le workspace et la région ; notez celui que vous comptez définir comme `DATABRICKS_ENDPOINT`.
* **Databricks Apps activé.** Exécutez `databricks apps list --profile <PROFILE>` et vérifiez que la commande aboutit (une liste vide convient également). Une erreur de permission ou `not enabled` signifie qu&#39;Apps n&#39;est pas disponible pour cette identité dans ce workspace.