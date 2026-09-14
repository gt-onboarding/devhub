Ce modèle met en place un système complet de gestion des stocks pour le commerce de détail sur la stack Databricks : une application React où les responsables de magasin suivent l&#39;état des stocks, examinent les recommandations de réapprovisionnement générées par l&#39;IA et valident les bons de commande — le tout s&#39;appuyant sur un pipeline medallion en temps réel et un job de prévision de la demande interchangeable.

### Flux de données \{#data-flow\}

Les données de ventes et de stocks transitent de Lakebase Postgres vers le lakehouse, y sont enrichies par un modèle de prévision de la demande, puis renvoyées à l&#39;application par synchronisation inverse :

1. Les **écritures OLTP** arrivent dans Lakebase Postgres (magasins, produits, niveaux de stock, transactions de vente, commandes de réapprovisionnement).
2. Le **Change Data Feed (CDF) de Lakebase** réplique chaque modification dans Unity Catalog sous forme de tables d&#39;historique CDC (couche bronze).
3. Un **Lakeflow Spark Declarative Pipeline** transforme l&#39;historique CDC en tables silver reflétant l&#39;état courant et en materialized views gold (vue d&#39;ensemble des stocks, alertes de stock faible, vélocité des ventes).
4. Un **Lakeflow Job** s&#39;exécute selon une planification, charge l&#39;historique des ventes silver et exécute un modèle de prévision de la demande enfichable pour produire des prévisions d&#39;unités sur 30 jours et des recommandations de réapprovisionnement dans une table gold Delta.
5. Les **Tables de synchronisation** (synchronisation inverse) répliquent les tables gold vers Lakebase pour des lectures à faible latence.
6. L&#39;**Inventory Intelligence App** (Databricks App) lit à la fois les tables OLTP et les tables gold synchronisées pour afficher des dashboards, des analyses détaillées par magasin, une file de réapprovisionnement et, en option, des analyses Genie.

### Conception \{#design\}

L&#39;application doit offrir un **design soigné et élégant** — typographie épurée, espacements cohérents et esthétique professionnelle propre au commerce de détail. Appuyez-vous sur les composants shadcn/ui comme fondation, sur Tailwind pour l&#39;ensemble du style et sur les couleurs de la marque dans toute l&#39;application. Les tableaux de bord doivent paraître riches en données sans être surchargés, et la file de réapprovisionnement doit rendre les flux de travail d&#39;approbation parfaitement fluides.

### Ce qu&#39;il faut adapter \{#what-to-adapt\}

Le provisionnement (schémas Unity Catalog, REPLICA IDENTITY Lakebase), l&#39;amorçage des données, les déploiements de pipelines, la synchronisation inverse et le déploiement de l&#39;application sont documentés dans le fichier **`README.md`** du dépôt, aux côtés du code.

Pour adapter ce modèle à vos besoins :

* **Catalogue** : définissez la variable `catalog` dans le `databricks.yml` de chaque pipeline avec le nom de votre catalogue Unity Catalog.
* **Lakebase** : faites pointer le `databricks.yml` de l&#39;application vers vos propres projet, branch et base de données Lakebase.
* **Tables** : le script d&#39;amorçage crée le schéma OLTP avec 5 magasins, 25 produits et 90 jours d&#39;historique de ventes. Une fois les données amorcées, configurez le Change Data Feed pour répliquer les tables du schéma `inventory`.
* **Tables de synchronisation** : créez manuellement les trois configurations de synchronisation inverse (consultez le README pour les correspondances exactes entre tables).
* **Modèle de prévision** : définissez la variable `forecast_model` du pipeline de prévision de la demande sur `weighted_moving_average` (valeur par défaut), `exponential_smoothing`, `prophet` ou `model_serving`.
* **Genie Agent** : créez un Genie Agent sur vos tables gold et définissez `genie_space_id` dans le bundle de l&#39;application pour activer l&#39;onglet Analytics.