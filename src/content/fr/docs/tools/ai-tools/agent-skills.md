---
title: Compétences d'agent
sourceOfTruth:
  skills:
    - databricks-core
  docs:
    - https://github.com/databricks/databricks-agent-skills
---

# Compétences d'agent \{#agent-skills\}

Les compétences d'agent sont des fichiers d'instructions que les assistants de codage IA chargent pour effectuer des tâches de développement Databricks. Databricks publie ses compétences dans le dépôt [databricks/databricks-agent-skills](https://github.com/databricks/databricks-agent-skills) et respecte le standard ouvert [compétences d'agent](https://agentskills.io/).

Les compétences expliquent à votre agent de codage le fonctionnement de Databricks : conventions de la CLI, schémas d'authentification, noms de ressources, etc. Il génère ainsi du code correct au lieu de procéder par approximations.

## Installation \{#install\}

Installez les compétences d'agent officielles de Databricks à l&#39;aide de la commande suivante :

```bash title="Common"
databricks aitools install
```

```bash title="All Options"
databricks aitools install \
  --scope $SCOPE \
  --agents $AGENTS \
  --skills $SKILLS \
  --skills-only \
  --path $OUTPUT_DIR \
  --experimental \
  --debug \
  -o json \
  --target $TARGET \
  --profile $DATABRICKS_PROFILE
```

:::note
La Databricks CLI doit être installée au préalable. Consultez [Databricks CLI](/docs/tools/databricks-cli) pour les instructions d&#39;installation.
:::

La CLI détecte les agents de codage installés sur votre machine. Pour les agents prenant en charge les plugins (Claude Code, Codex CLI, GitHub Copilot), elle installe le plugin `databricks` via la CLI propre à l&#39;agent. Les agents qui ne permettent pas d&#39;installer un plugin en mode headless (Cursor, OpenCode, Antigravity) reçoivent des fichiers de compétences bruts liés depuis un emplacement partagé (`~/.databricks/aitools/skills/`).

Options de `databricks aitools install` :

<!-- cli-options:aitools install -->

| Option            | Description                                                                                          |
| ----------------- | ---------------------------------------------------------------------------------------------------- |
| `--agents`        | Agents pour lesquels effectuer l&#39;installation (séparés par des virgules, ex. claude-code,cursor) |
| `--experimental`  | Inclure les compétences expérimentales                                                                    |
| `--path`          | Écrire les fichiers de compétences résolus dans ce répertoire (aucun agent, aucun état)                   |
| `--scope`         | Portée d&#39;installation : projet ou global (par défaut : global, ou demande en mode interactif)    |
| `--skills`        | Compétences spécifiques à installer (séparées par des virgules)                                           |
| `--skills-only`   | Forcer les fichiers de compétences bruts pour chaque agent au lieu du plugin                              |
| `--debug`         | activer la journalisation de débogage                                                                |
| `--output`, `-o`  | type de sortie : text ou json (text par défaut)                                                      |
| `--profile`, `-p` | profil ~/.databrickscfg                                                                              |
| `--target`, `-t`  | cible de bundle à utiliser (le cas échéant)                                                          |

<!-- /cli-options -->

Notez que `--skills-only` et `--path` ne peuvent pas être combinés.


## Gestion \{#manage\}

```bash title="List, update, or remove skills"
databricks aitools list
databricks aitools update
databricks aitools uninstall
```

`update` récupère la dernière version publiée et installe automatiquement les nouvelles compétences. Ajoutez `--check` pour prévisualiser sans télécharger, `--no-new` pour désactiver l&#39;installation automatique des nouvelles compétences, `--no-prune` pour conserver les compétences retirées du manifeste, ou `--force` pour forcer le retéléchargement même si les versions correspondent.

`uninstall` supprime les fichiers du plugin ou de la compétence. Ajoutez `--keep-marketplace` pour conserver l&#39;enregistrement dans la marketplace lors de la suppression d&#39;un plugin.

Toutes les commandes acceptent `--scope` pour définir la portée : `install` et `uninstall` acceptent `project` ou `global` ; `update` et `list` acceptent également `both` (`list` utilise `both` par défaut).


## Autres méthodes d'installation \{#alternative-install-methods\}

Vous pouvez également installer les compétences Databricks avec la [CLI Compétences](https://github.com/vercel-labs/skills) (par exemple `npx skills add databricks/databricks-agent-skills`) ou directement depuis le chat Cursor avec `/add-plugin databricks`. Cela dit, `databricks aitools install` reste la méthode recommandée : elle est maintenue par Databricks et installe toujours les dernières versions stables.

## Compétences disponibles \{#available-skills\}

Exécutez `databricks aitools list` pour afficher les compétences disponibles et leur état d'installation.

<!-- aitools-skills -->

| Compétence                               | Description                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `databricks-agent-bricks`                | Créer des Agent Bricks : des Knowledge Assistants (KA) pour les questions-réponses sur les documents et des Supervisor Agents pour l’orchestration multi-agents (MAS).                                                                                                                                                                                                                                                                           |
| `databricks-ai-functions`                | Utilisez les fonctions d’IA intégrées à Databricks (ai&#95;classify, ai&#95;extract, ai&#95;summarize, ai&#95;mask, ai&#95;translate, ai&#95;fix&#95;grammar, ai&#95;gen, ai&#95;analyze&#95;sentiment, ai&#95;similarity, ai&#95;parse&#95;document, ai&#95;prep&#95;search, ai&#95;query, ai&#95;forecast) pour ajouter directement des fonctionnalités d’IA à vos pipelines SQL et PySpark, sans gérer les endpoints de modèles.              |
| `databricks-aibi-dashboards`             | Créez des tableaux de bord Databricks AI/BI.                                                                                                                                                                                                                                                                                                                                                                                                     |
| `databricks-app-design`                  | Concevez l’UX des écrans de données de Databricks Apps développées avec du code personnalisé (AppKit/React) — pages de KPI et de vue d’ensemble, rapports, graphiques, tableaux et assistants de données Genie et de chat — en les associant à des composants AppKit concrets.                                                                                                                                                                   |
| `databricks-apps`                        | Développez des applications sur la plateforme Databricks Apps.                                                                                                                                                                                                                                                                                                                                                                                   |
| `databricks-apps-python`                 | Backend Python pour Databricks Apps — FastAPI (par défaut), Flask, Dash, Streamlit, Gradio, Reflex. **Pour une nouvelle Databricks App, l&#39;option par défaut est `databricks-apps` (AppKit — Node/TypeScript/React) : privilégiez-la d&#39;abord.** N&#39;utilisez cette compétence que si l&#39;utilisateur demande un backend Python, s&#39;il étend une application Python existante ou si l&#39;équipe travaille exclusivement en Python. |
| `databricks-core`                        | Opérations de Databricks CLI et compétence principale servant de point d’entrée pour son utilisation : authentification, sélection de profil et bundles.                                                                                                                                                                                                                                                                                         |
| `databricks-dabs`                        | Créez, configurez, validez, déployez, exécutez et gérez les Declarative Automation Bundles (DABs, anciennement Databricks Asset Bundles).                                                                                                                                                                                                                                                                                                        |
| `databricks-data-discovery`              | Découvrez, explorez et interrogez les données Databricks via Genie — l’équivalent en ligne de commande de Genie One MCP.                                                                                                                                                                                                                                                                                                                         |
| `databricks-dbsql`                       | Fonctionnalités avancées de Databricks SQL (DBSQL) et capacités des SQL warehouses.                                                                                                                                                                                                                                                                                                                                                              |
| `databricks-docs`                        | Référence de la documentation Databricks via l’index llms.txt.                                                                                                                                                                                                                                                                                                                                                                                   |
| `databricks-execution-compute`           | Exécutez du code et gérez le compute sur Databricks : exécutez du Python/Scala/SQL/R sur des clusters serverless, classiques ou interactifs, et créez, redimensionnez ou supprimez des clusters et des SQL warehouses.                                                                                                                                                                                                                           |
| `databricks-iceberg`                     | Tables Apache Iceberg sur Databricks — tables Iceberg gérées, lectures Iceberg externes (anciennement Uniform), mode de compatibilité, catalogue REST Iceberg (IRC), Iceberg v3, interopérabilité avec Snowflake, PyIceberg, Spark OSS, accès aux moteurs externes et distribution des identifiants.                                                                                                                                             |
| `databricks-jobs`                        | Développez et déployez des Lakeflow Jobs sur Databricks via des DAB, le SDK Python ou l’interface de ligne de commande.                                                                                                                                                                                                                                                                                                                          |
| `databricks-lakebase`                    | Databricks Lakebase Postgres : projets, mise à l’échelle, connectivité, tables Lakebase synchronisées et API de données.                                                                                                                                                                                                                                                                                                                         |
| `databricks-lakeflow-connect`            | Créez des pipelines d’ingestion gérés dans Databricks à l’aide de Lakeflow Connect.                                                                                                                                                                                                                                                                                                                                                              |
| `databricks-metric-views`                | Vues de métriques Unity Catalog : définissez, créez, interrogez et gérez des métriques métier régies dans YAML.                                                                                                                                                                                                                                                                                                                                  |
| `databricks-ml-training`                 | Entraînez des modèles de machine learning sur Databricks.                                                                                                                                                                                                                                                                                                                                                                                        |
| `databricks-mlflow-evaluation`           | Évaluation d’agents GenAI avec MLflow 3.                                                                                                                                                                                                                                                                                                                                                                                                         |
| `databricks-model-serving`               | Cycle de vie et opérations des endpoints Model Serving de Databricks.                                                                                                                                                                                                                                                                                                                                                                            |
| `databricks-pipelines`                   | Développez des Lakeflow Spark Declarative Pipelines (anciennement Delta Live Tables) sur Databricks.                                                                                                                                                                                                                                                                                                                                             |
| `databricks-python-sdk`                  | Guide de développement Databricks couvrant le SDK Python, Databricks Connect, la CLI et l’API REST.                                                                                                                                                                                                                                                                                                                                              |
| `databricks-serverless-migration`        | Migrez les charges de travail Databricks du compute classique vers le compute serverless.                                                                                                                                                                                                                                                                                                                                                        |
| `databricks-spark-structured-streaming`  | Guide complet de Spark Structured Streaming pour les charges de travail en production.                                                                                                                                                                                                                                                                                                                                                           |
| `databricks-synthetic-data-gen`          | Générez des données synthétiques réalistes avec Spark + Faker (fortement recommandé).                                                                                                                                                                                                                                                                                                                                                            |
| `databricks-unity-catalog`               | Gouvernance, contrôle d’accès et observabilité d’Unity Catalog.                                                                                                                                                                                                                                                                                                                                                                                  |
| `databricks-unstructured-pdf-generation` | Créez des jeux de données d’évaluation pour le RAG et les documents non structurés, ainsi que des documents de démonstration (par ex. pour Knowledge Assistant) sur Databricks : générez localement des PDF synthétiques, chargez-les dans des volumes Unity Catalog et associez chaque document à des questions de test pour évaluer la récupération.                                                                                           |
| `databricks-vector-search`               | Endpoints et index Databricks Vector Search pour le RAG et la recherche sémantique ; présentation des types d’index, des modes de recherche et des modèles RAG de bout en bout                                                                                                                                                                                                                                                                   |
| `databricks-zerobus-ingest`              | Créez des clients Zerobus Ingest pour ingérer des données dans des tables Databricks Delta presque en temps réel via gRPC.                                                                                                                                                                                                                                                                                                                       |

<!-- /aitools-skills -->

Les compétences suivantes sont expérimentales. Installez-les en ajoutant `--experimental` à `databricks aitools install` :

<!-- aitools-skills-experimental -->

| Compétence                 | Description                                                                                                                                    |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `databricks-ai-runtime`    | CLI Databricks AI Runtime (`air`) — l'outil en ligne de commande permettant de soumettre et de gérer des charges de travail d'entraînement GPU sur le compute serverless Databricks. |
| `databricks-genie`         | Créez et interrogez des Genie Spaces Databricks pour explorer vos données en SQL via le langage naturel.                                        |
| `spark-python-data-source` | Créez des sources de données Python personnalisées pour Apache Spark avec l'API PySpark DataSource — lecteurs/écrivains par lots et en streaming pour les systèmes externes. |

<!-- /aitools-skills-experimental -->

## Et ensuite ? \{#where-to-next\}

Une fois les compétences d'agent Databricks installées, votre agent de codage dispose de tout le contexte nécessaire pour développer et déployer.

- Pour fournir davantage de contexte à votre agent, installez le [Docs MCP Server](/docs/tools/ai-tools/docs-mcp-server).
- Prêt à vous lancer ? Découvrez comment les [templates](/docs/templates) vous permettent de mettre en place rapidement la structure de votre projet.