Ce modèle réunit toute la pile de développement Databricks dans une seule application de données opérationnelle : une console de support propulsée par l&#39;IA, où chaque message client est automatiquement trié par un LLM et où les agents du support examinent, approuvent ou corrigent la suggestion depuis un outil interne conçu sur mesure.

### Flux de données \{#data-flow\}

Les interactions client circulent depuis la base de données OLTP de votre application (Lakebase Postgres) vers le lakehouse via le CDC, sont enrichies par un agent IA, puis restituées à la console de support par synchronisation inverse :

1. Les **écritures OLTP** arrivent dans Lakebase Postgres (utilisateurs, commandes, tickets de support, messages).
2. Le **Change Data Feed (CDF) de Lakebase** réplique chaque modification dans Unity Catalog sous forme de tables d&#39;historique CDC (couche bronze).
3. Un **Lakeflow Spark Declarative Pipeline** transforme l&#39;historique CDC en tables silver reflétant l&#39;état courant et en vues matérialisées gold analytiques (revenu quotidien, vue d&#39;ensemble du support, profils utilisateurs, contexte des tickets).
4. Un **Lakeflow Job** s&#39;exécute chaque minute : il repère les messages sans réponse, constitue un contexte riche à partir des tables gold, appelle un LLM via un serving endpoint et fusionne les réponses suggérées dans une table Delta.
5. Les **tables synchronisées** (synchronisation inverse) répliquent les tables gold vers Lakebase pour des lectures à faible latence.
6. La **console de support** (Databricks App) lit à la fois les tables OLTP et les tables gold synchronisées pour présenter les tickets, les suggestions de l&#39;IA et les analyses.

### Éléments à adapter \{#what-to-adapt\}

Le provisionnement (étapes manuelles et SQL), le chargement initial des données, le déploiement des pipelines, la synchronisation inverse et le déploiement de l&#39;application sont documentés dans le fichier **`README.md`** du dépôt, aux côtés du code.

Pour adapter ce modèle à vos besoins :

* **Catalogue** : définissez la variable `catalog` du fichier `databricks.yml` de chaque pipeline avec le nom de votre catalogue Unity Catalog.
* **Lakebase** : faites pointer le fichier `databricks.yml` de l&#39;application vers vos propres projet, branche et base de données Lakebase.
* **Tables** : le script de chargement initial crée le schéma OLTP. Une fois les données chargées, configurez Change Data Feed pour répliquer les tables de votre schéma `public`.
* **Tables de synchronisation** : créez manuellement les quatre configurations de synchronisation inverse (consultez le README pour connaître les correspondances exactes entre les tables).
* **Serving endpoint** : définissez la variable `endpoint` avec le serving endpoint de votre choix.
* **Genie Agent** : créez un Genie Agent sur vos tables gold et renseignez la valeur de `genie_space_id` dans le bundle de l&#39;application.