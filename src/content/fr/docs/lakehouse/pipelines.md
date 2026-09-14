---
title: Pipelines Lakeflow et fraîcheur des données
sidebar_label: Pipelines et fraîcheur
description: Affichez des horodatages « ces données sont-elles à jour ? » dans votre application AppKit. Lisez les métadonnées d'actualisation par table et la chronologie des mises à jour du pipeline via le plugin Analytics.
sourceOfTruth:
  skills:
    - databricks-pipelines
  docs:
    - /docs/appkit/v0/plugins/analytics
    - https://docs.databricks.com/aws/en/ldp/
---

# Pipelines Lakeflow et fraîcheur des données \{#lakeflow-pipelines-and-data-freshness\}

Les Lakeflow Spark Declarative Pipelines (SDP) alimentent les tables analytiques que votre application lit. La création de pipelines relève de l&#39;ingénierie des données, une tâche à laquelle vous ne touchez pratiquement jamais en tant que développeur AppKit. Votre rôle se situe du côté lecture : afficher la sortie des pipelines et répondre à la question « ces données sont-elles assez fraîches pour être affichées ? » avant d&#39;en faire le rendu.

Les signaux SQL y répondent : les métadonnées d&#39;actualisation par table pour les vues matérialisées et les tables de streaming, ainsi que la chronologie des mises à jour du pipeline. Les deux passent par le [plugin Analytics](/fr/docs/appkit/v0/plugins/analytics) que vous avez configuré dans [Lectures analytiques](/fr/docs/lakehouse/analytical-reads).

Lakeflow est la suite d&#39;ingénierie des données de Databricks. En tant que développeur AppKit, vous vous contentez de lire la sortie des pipelines, mais il est utile d&#39;en connaître les composants :

* **Lakeflow Connect** pour l&#39;ingestion, avec des connecteurs gérés qui déposent les données dans Unity Catalog.
* **Lakeflow Spark Declarative Pipelines** pour la transformation, écrits en SQL ou en Python, qui produisent des vues matérialisées et des tables de streaming.
* **Lakeflow Jobs** pour l&#39;orchestration. Voir [Lakeflow Jobs](/fr/docs/lakehouse/jobs) pour le déclenchement depuis une application.
* **Lakeflow Designer** pour la création visuelle de pipelines sans code.

Consultez la [documentation Lakeflow](https://docs.databricks.com/aws/en/ldp/) pour découvrir toute la famille de produits.

## Signaux de fraîcheur \{#freshness-signals\}

* **Métadonnées d&#39;actualisation par table** : `DESCRIBE TABLE EXTENDED <name> AS JSON` renvoie un bloc `refresh_information` pour les vues matérialisées et les tables de streaming. Ce bloc contient `last_refreshed_at`, `last_refresh_type`, `latest_refresh_status`, `latest_refresh_link` et `refresh_schedule`. Consultez [DESCRIBE TABLE](https://docs.databricks.com/aws/en/sql/language-manual/sql-ref-syntax-aux-describe-table) pour le schéma de sortie complet.
* **Chronologie des mises à jour de pipeline** : `system.lakeflow.pipeline_update_timeline` enregistre chaque mise à jour de pipeline avec `pipeline_id`, `update_id`, `period_start_time`, `period_end_time`, `result_state` (`COMPLETED`, `FAILED` ou `CANCELED`) et les détails du déclencheur. Filtrez sur `pipeline_id` et `result_state = 'COMPLETED'` pour identifier la mise à jour réussie la plus récente du pipeline auquel appartient une table. Consultez la [référence des tables système](https://docs.databricks.com/aws/en/admin/system-tables/jobs#pipeline-update-timeline) pour la liste complète des colonnes.

Pour un diagnostic plus approfondi (état par flux, résultats des attentes, événements de lignage), utilisez le [journal d&#39;événements du pipeline](https://docs.databricks.com/aws/en/ldp/monitor-event-logs) via la fonction table `event_log()`. Le journal d&#39;événements permet de répondre aux questions du type « pourquoi cette mise à jour a-t-elle échoué », mais pas à « ces données sont-elles assez fraîches pour être affichées ».

## Une requête pour un badge « Dernière mise à jour » \{#a-last-updated-badge-query\}

Placez ce fichier dans `config/queries/`. La requête s&#39;exécute via le plugin Analytics comme n&#39;importe quel autre fichier SQL.

```sql title="config/queries/last_pipeline_update.obo.sql"
-- @param pipelineId STRING
SELECT period_end_time, result_state
FROM system.lakeflow.pipeline_update_timeline
WHERE pipeline_id = :pipelineId
  AND result_state = 'COMPLETED'
ORDER BY period_end_time DESC
LIMIT 1;
```

Appelez le hook depuis React avec l&#39;ID du pipeline :

```tsx
import { useMemo } from "react";
import { sql } from "@databricks/appkit-ui/js";
import { useAnalyticsQuery } from "@databricks/appkit-ui/react";

const params = useMemo(
  () => ({ pipelineId: sql.string("ec2a0ff4-d2a5-4c8c-bf1d-d9f12f10e749") }),
  [],
);
const { data } = useAnalyticsQuery("last_pipeline_update", params);
```

Le suffixe `.obo.sql` exécute la requête sous l&#39;identité de l&#39;utilisateur connecté. Si le service principal de votre application dispose du privilège `SELECT` sur `system.lakeflow.pipeline_update_timeline`, supprimez le `.obo` : la requête s&#39;exécutera alors sous l&#39;identité de l&#39;application. Consultez [Rédiger des fichiers SQL](/fr/docs/lakehouse/analytical-reads#author-sql-files) pour la règle complète de nommage des fichiers.

## Déclencher une actualisation depuis l&#39;application \{#triggering-a-refresh-from-the-app\}

Il n&#39;existe pas de plugin AppKit dédié aux pipelines. Appelez directement le SDK depuis votre handler avec `w.pipelines.startUpdate({ pipelineId })`, ou encapsulez le pipeline dans un [job Lakeflow](/fr/docs/lakehouse/jobs) et utilisez le Jobs plugin.

## Pour aller plus loin \{#where-to-next\}

Consultez [Architecture médaillon à partir de tables d&#39;historique CDC](/fr/templates/medallion-architecture-from-cdc) pour découvrir le pipeline SDP canonique qui produit ces tables, ou [Analytique de données opérationnelles](/fr/templates/operational-data-analytics) pour le modèle de bout en bout UC + CDC + médaillon.