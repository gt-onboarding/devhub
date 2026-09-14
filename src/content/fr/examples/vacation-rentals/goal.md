Ce modèle illustre une console d&#39;exploitation interne pour une plateforme de locations de vacances (« Wanderbricks »). Les opérateurs suivent les performances de revenus par destination, traitent une file d&#39;attente de réservations avec des indicateurs propres à chaque réservation et des notes d&#39;agent, et posent des questions en langage naturel sur l&#39;activité via un panneau de conversation Genie intégré.

### Flux de données \{#data-flow\}

L&#39;application combine quatre primitives Databricks derrière une interface React unique :

1. **SQL Warehouse** exécute les requêtes analytiques (revenus par destination, détail d&#39;une réservation) sur les tables préchargées `samples.wanderbricks.{bookings,properties,destinations,reviews}`. Les requêtes se trouvent dans `config/queries/*.sql` et sont exécutées via le plugin AppKit `analytics`.
2. **Lakebase Postgres** stocke l&#39;état géré par l&#39;opérateur dans les tables `app.booking_flags` et `app.booking_notes`. Le serveur Express crée le schéma et les tables au démarrage et expose des routes CRUD pour signaler des réservations et ajouter des notes d&#39;agent.
3. **Genie Agent** (« Wanderbricks ») est configuré sur les tables de réservations, de propriétés et de destinations. Le plugin AppKit `genie` intègre un panneau de discussion permettant aux utilisateurs de poser, en langage naturel, des questions sur les dépenses, le taux d&#39;occupation et les évaluations.
4. **Databricks App** assure la cohésion de l&#39;ensemble : un serveur Express + AppKit et un client Vite/React/Tailwind, déployés via un Declarative Automation Bundle (anciennement Databricks Asset Bundle) qui déclare le SQL warehouse, le Genie Agent et la base de données Lakebase comme ressources de l&#39;application.

### Ce qu&#39;il faut adapter \{#what-to-adapt\}

La configuration, les variables d&#39;environnement et le déploiement du bundle sont documentés dans le fichier **`README.md`** du dépôt.

Pour adapter ce modèle à vos besoins :

* **Données sources** : faites pointer les fichiers SQL d&#39;analyse vers votre propre catalogue et schéma plutôt que vers `samples.wanderbricks.*`. Ajustez les jointures pour qu&#39;elles correspondent à votre modèle de réservations, de biens et de destinations.
* **SQL Warehouse** : définissez `sql_warehouse_id` dans `databricks.yml` avec le warehouse que l&#39;application doit interroger.
* **Lakebase** : remplacez `postgres_branch` et `postgres_database` par vos propres projet, branch et base de données Lakebase. Les tables `app.booking_flags` et `app.booking_notes` sont créées automatiquement à la première exécution.
* **Genie Agent** : créez un Genie Agent sur vos tables de réservations, puis définissez `genie_space_id` et `genie_space_name` dans `databricks.yml`.
* **Vocabulaire métier** : l&#39;interface s&#39;articule autour des locations de vacances (destinations, réservations, notes des agents). Pour d&#39;autres consoles opérationnelles (logistique, support, partenariats), renommez les routes et les composants et redirigez les requêtes analytiques — l&#39;ossature Lakebase + Genie + analyse reste identique.