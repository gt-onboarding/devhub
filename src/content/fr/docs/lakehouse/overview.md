---
title: Qu'est-ce que le Data Lakehouse ?
sidebar_label: Vue d'ensemble
description: La couche de données de la Databricks Data Intelligence Platform. Des tables analytiques gouvernées dans Unity Catalog, alimentées par Lakeflow. Documentation complémentaire pour les applications AppKit.
sourceOfTruth:
  skills:
    - databricks-dbsql
    - databricks-jobs
    - databricks-pipelines
  docs:
    - /docs/appkit/v0/plugins/analytics
    - /docs/appkit/v0/plugins/jobs
    - https://docs.databricks.com/aws/en/lakehouse/
---

# Qu&#39;est-ce que le Data Lakehouse ? \{#what-is-the-data-lakehouse\}

Le Data Lakehouse est la couche analytique de votre workspace Databricks : des tables et des vues gouvernées par Unity Catalog et alimentées par Lakeflow. Lakeflow est la suite de services d&#39;ingénierie des données de Databricks, qui couvre l&#39;ingestion, l&#39;orchestration et la gestion des pipelines. Depuis une application AppKit, vous lisez ses tables, déclenchez des Lakeflow Jobs et affichez les horodatages de « dernière mise à jour » issus des pipelines qui les ont alimentées.

Le [plugin Analytics](/fr/docs/appkit/v0/plugins/analytics) gère les lectures depuis un SQL warehouse (voir [Lectures analytiques](/fr/docs/lakehouse/analytical-reads) et [Pipelines et fraîcheur](/fr/docs/lakehouse/pipelines)). Le [plugin Jobs](/fr/docs/appkit/v0/plugins/jobs) gère le déclenchement des exécutions et leur progression (voir [Lakeflow Jobs](/fr/docs/lakehouse/jobs)).

## Quand utiliser le Data Lakehouse \{#when-to-use-the-data-lakehouse\}

* Vous devez lire des données analytiques curées : revenus, clients, événements, sorties de modèles.
* Vous affichez des agrégats de type tableau de bord ou des vues en liste portant sur des millions de lignes.
* Vous déclenchez un réentraînement de modèle, un traitement ETL ou un long backfill de façon asynchrone suite à une action de l&#39;utilisateur.

## Quand ne pas l&#39;utiliser \{#when-not-to-use-it\}

* **Lectures inférieures à la seconde sur une requête utilisateur**, comme la saisie prédictive ou l&#39;autocomplétion. Utilisez directement [Lakebase Postgres](/fr/docs/lakebase/overview), ou répliquez une table UC vers Lakebase sous forme de table synchronisée.
* **Écritures transactionnelles depuis votre application** (commandes, sessions, journaux d&#39;audit). Utilisez [Lakebase Postgres](/fr/docs/lakebase/overview).
* **Questions-réponses en langage naturel sur des tables gouvernées**. Utilisez [Genie](/fr/docs/agents/genie).

Vous n&#39;avez pas non plus à écrire de pipelines, à configurer Spark ni à dimensionner des clusters : ce sont des tâches d&#39;ingénierie des données, qui s&#39;effectuent dans le workspace Databricks ou via les [Declarative Automation Bundles](https://docs.databricks.com/aws/en/dev-tools/bundles/).

## Choisissez un modèle de départ \{#pick-a-template-to-start-from\}

Chacun réunit les mécanismes décrits dans les pages ci-dessus en un schéma fonctionnel.

| Vous souhaitez...                                                        | Modèle                                                            |
| --------------------------------------------------------------------- | ------------------------------------------------------------------- |
| Répliquer une table UC dans Lakebase pour des lectures à faible latence              | [Sync Tables (Autoscaling)](/fr/templates/sync-tables-autoscaling)     |
| Mettre en place le pipeline complet UC + Lakebase Change Data Feed + médaillon | [Operational Data Analytics](/fr/templates/operational-data-analytics) |

## Pour aller plus loin \{#where-to-next\}

* [Lectures analytiques](/fr/docs/lakehouse/analytical-reads) avec le plugin Analytics, les fichiers SQL et les requêtes on-behalf-of-user.
* [Lakeflow Jobs](/fr/docs/lakehouse/jobs) pour le plugin Jobs, `runNow` et la progression via SSE.
* [Pipelines et fraîcheur des données](/fr/docs/lakehouse/pipelines) pour les indicateurs de fraîcheur via le plugin Analytics.