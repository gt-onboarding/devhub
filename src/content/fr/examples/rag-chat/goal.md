Ce modèle illustre une application de chat à génération augmentée par récupération (RAG) construite sur Databricks : la question de l&#39;utilisateur est convertie en embedding, les documents similaires sont récupérés depuis un magasin pgvector dans Lakebase Postgres, puis le contexte ainsi obtenu est injecté dans un appel Model Serving qui renvoie la réponse en streaming. Les conversations et les sources sont conservées pour chaque chat dans Lakebase.

### Flux de données \{#data-flow\}

L&#39;ensemble de l&#39;état de récupération et de conversation réside dans Lakebase Postgres ; la génération s&#39;appuie sur Model Serving :

1. **L&#39;amorçage** récupère quelques articles Wikipédia au démarrage, les découpe en fragments par paragraphe, encode chaque fragment via l&#39;endpoint d&#39;embeddings du modèle de fondation (`databricks-gte-large-en` par défaut), puis écrit les lignes dans `rag.documents` avec une colonne `vector(1024)`.
2. **Les tours utilisateur** sont encodés avec le même endpoint. Le serveur exécute une recherche par similarité cosinus pgvector afin de récupérer les k fragments les plus pertinents.
3. **Injection du contexte** : les fragments récupérés sont placés en tête sous forme de message système, avant l&#39;envoi de l&#39;historique de conversation de l&#39;utilisateur à l&#39;endpoint de complétion de chat (`databricks-gpt-5-4-mini` par défaut) via Model Serving.
4. **Streaming** : `streamText` diffuse les tokens vers le client tandis qu&#39;un callback `onFinish` ajoute le tour de l&#39;assistant dans Lakebase.
5. **Historique de conversation** : chaque tour utilisateur et assistant est conservé dans `chat.messages`, indexé par `chat_id`, ce qui permet de reprendre les conversations.

### Approche du modèle \{#template-approach\}

Contrairement aux autres modèles, **ce modèle est conçu pour être utilisé via `databricks apps init`**, et non `git clone`. Le flux d&#39;initialisation :

* Demande les noms de la branch Lakebase Postgres et de la ressource de base de données.
* Résout automatiquement `PGHOST`, `PGDATABASE` et `LAKEBASE_ENDPOINT` dans votre fichier `.env` local en appelant les API Lakebase.
* Écrit `DATABRICKS_CONFIG_PROFILE` ou `DATABRICKS_HOST` selon votre configuration de la CLI Databricks.
* Vous place directement dans un répertoire de projet prêt à l&#39;emploi, nommé d&#39;après `--name`.

Cela valide le [système de modèles AppKit](/docs/appkit/v0/development/templates) comme moyen de déployer des modèles DevHub — voyez `appkit.plugins.json` et `.env.tmpl` dans le modèle pour en comprendre le fonctionnement.

### Ce qu&#39;il faut adapter \{#what-to-adapt\}

La configuration et le provisionnement sont documentés dans le fichier **`README.md`** du dépôt.

Pour adapter ce modèle à vos besoins :

* **Lakebase** : faites pointer le bundle vers vos propres project, branch et base de données Lakebase (demandés lors de l&#39;initialisation).
* **Model Serving endpoint** : redéfinissez `DATABRICKS_ENDPOINT` pour utiliser un autre modèle de chat (par exemple `databricks-claude-sonnet-4-6`).
* **Endpoint d&#39;embeddings** : redéfinissez `DATABRICKS_EMBEDDING_ENDPOINT` si vous souhaitez un autre modèle d&#39;embedding. Assurez-vous que la dimension `vector(N)` dans `server/lib/rag-store.ts` corresponde.
* **Données d&#39;amorçage** : remplacez la liste d&#39;articles Wikipedia dans `server/lib/seed-data.ts` par votre propre corpus. La fonction de découpage sépare le texte aux limites de paragraphe — adaptez-la si votre source a une structure différente.
* **Récupération** : par défaut, le top-k est de 5 et la métrique de similarité est le cosinus. Ajustez ces paramètres dans `retrieveSimilar()`.