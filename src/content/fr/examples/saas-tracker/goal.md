Ce modèle illustre un outil CRUD interne simple conçu sur Databricks : un suivi des abonnements SaaS où les équipes recensent les outils qu&#39;elles utilisent, le responsable de chaque abonnement, son coût et sa date de renouvellement. Un Genie Agent fournit des analyses en libre-service sur les données d&#39;abonnement.

### Flux de données \{#data-flow\}

Toutes les données d&#39;abonnement sont stockées dans une seule table Lakebase Postgres et servies directement à l&#39;application :

1. **Lakebase Postgres** héberge la table `saas_tracker.subscriptions`, qui contient le nom, le fournisseur, le coût, le cycle de facturation, le propriétaire, le statut et les dates de renouvellement.
2. La **SaaS Tracker App** (Databricks App) lit et écrit les abonnements via des routes d&#39;API Express adossées à Lakebase.
3. Des **requêtes SQL Warehouse** alimentent le tableau de bord analytique (vue d&#39;ensemble des dépenses, dépenses par catégorie).
4. Un **Genie Agent** configuré sur la table des abonnements permet aux utilisateurs de poser des questions en langage naturel sur les dépenses, les propriétaires et les renouvellements.

### Éléments à adapter \{#what-to-adapt\}

La configuration et le provisionnement sont décrits dans le fichier **`README.md`** du dépôt.

Pour adapter ce modèle à vos besoins :

* **Lakebase** : faites pointer le fichier `databricks.yml` de l&#39;application vers vos propres project, branch et base de données Lakebase.
* **SQL Warehouse** : définissez l&#39;ID du warehouse utilisé pour les requêtes analytiques.
* **Genie Agent** : créez un Genie Agent sur la table `saas_tracker.subscriptions`, puis renseignez l&#39;ID du space.
* **Catégories** : ajustez la liste des catégories dans les routes serveur et le composant de formulaire pour qu&#39;elle corresponde aux services de votre organisation.
* **Données d&#39;amorçage** : le script d&#39;amorçage crée 18 abonnements de démonstration réalistes. Remplacez-les par vos propres données ou utilisez le formulaire d&#39;ajout de l&#39;application.