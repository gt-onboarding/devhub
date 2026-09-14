Ce modèle illustre un outil interne de modération de contenu conçu sur Databricks : les auteurs soumettent du contenu destiné à différents canaux (blog d&#39;entreprise, LinkedIn, Twitter, newsletter, communiqués de presse), les modérateurs gèrent les directives propres à chaque canal, et un LLM évalue chaque soumission au regard de ces directives avant qu&#39;un relecteur humain ne tranche.

### Flux de données \{#data-flow\}

Le contenu transite par un pipeline de revue reposant sur Lakebase et Model Serving :

1. **Les auteurs soumettent du contenu** à Lakebase Postgres, en précisant un titre, un corps de texte et une cible de contenu (blog, LinkedIn, etc.).
2. **L&#39;évaluation par IA** se déclenche automatiquement. Le serveur récupère les directives actives pour la cible de contenu, envoie le contenu accompagné des directives à un Model Serving endpoint, puis enregistre le score de conformité (0-100), les problèmes signalés et les suggestions d&#39;amélioration.
3. **Les modérateurs examinent** les soumissions depuis une file d&#39;attente qui affiche le score IA en regard de chacune d&#39;elles. Ils les approuvent, les rejettent ou demandent des révisions accompagnées d&#39;un feedback.
4. **La gestion des directives** permet aux modérateurs de créer et de mettre à jour des règles par cible de contenu. Lorsque les directives évoluent, les modérateurs peuvent réanalyser les soumissions existantes.
5. **Les queries SQL Warehouse** alimentent le dashboard analytique (nombre de soumissions, taux d&#39;approbation, score de conformité moyen par cible).
6. Un **Genie Agent** s&#39;appuyant sur les tables de modération de contenu permet de poser des questions en langage naturel sur les performances du contenu.

### Éléments à adapter \{#what-to-adapt\}

La configuration et le provisionnement sont documentés dans le fichier **`README.md`** du dépôt.

Pour adapter ce modèle à vos besoins :

* **Lakebase** : faites pointer le fichier `databricks.yml` de l&#39;application vers vos propres projet, branche et base de données Lakebase.
* **SQL Warehouse** : définissez l&#39;ID du warehouse utilisé pour les requêtes analytiques.
* **Serving Endpoint** : définissez le nom du endpoint de model serving pour l&#39;analyse de contenu par IA (par exemple `databricks-claude-sonnet-4-6`). L&#39;évaluation par IA est facultative : l&#39;application fonctionne sans.
* **Genie Agent** : créez un Genie Agent sur les tables `content_moderation`, puis définissez l&#39;ID du space.
* **Cibles de contenu** : ajustez la liste des cibles dans les routes serveur et les utilitaires client pour qu&#39;elle corresponde aux canaux de contenu de votre organisation.
* **Directives** : remplacez les directives initiales par les politiques de contenu réelles de votre organisation.
* **Données initiales** : le script de seed crée 7 directives, 10 exemples de soumissions et 5 revues. Remplacez-les par vos propres données ou utilisez le formulaire de soumission de l&#39;application.