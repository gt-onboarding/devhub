Une Databricks App avec Lakebase Postgres pour le stockage persistant des données. L&#39;application inclut la configuration du schéma, des routes d&#39;API CRUD complètes et se déploie sur la plateforme Databricks Apps.

### Composants \{#components\}

1. **Create a Lakebase Project** — provisionnez un projet managed Postgres avec un endpoint et une base de données, puis récupérez les valeurs de connexion.
2. **Lakebase Data Persistence** — ajoutez le plugin Lakebase à votre application, avec initialisation du schéma, routes CRUD et modèles d&#39;accès aux données.