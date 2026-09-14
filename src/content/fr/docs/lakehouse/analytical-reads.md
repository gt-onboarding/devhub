---
title: Lire des tables Unity Catalog
sidebar_label: Lectures analytiques
description: Lisez des tables Unity Catalog gouvernées depuis votre application AppKit grâce au plugin Analytics. Fichiers SQL, requêtes on-behalf-of-user, liaison de ressource SQL warehouse.
sourceOfTruth:
  skills:
    - databricks-dbsql
    - databricks-unity-catalog
  docs:
    - /docs/appkit/v0/plugins/analytics
    - https://docs.databricks.com/aws/en/sql/
    - https://docs.databricks.com/aws/en/data-governance/unity-catalog/
---

# Lire des tables Unity Catalog \{#read-unity-catalog-tables\}

Pour exécuter des requêtes analytiques sur des tables Databricks depuis votre application AppKit, vous avez besoin d'un SQL warehouse (le compute SQL de Databricks). L'[plugin Analytics](/docs/appkit/v0/plugins/analytics) y relie votre handler : les fichiers SQL sont placés dans `config/queries/`, le warehouse les exécute et renvoie des lignes typées. Votre handler, lui, ne vérifie pas les permissions.

Les tables interrogées par le warehouse sont régies par Unity Catalog (UC). UC gère l'espace de noms à trois niveaux (`catalog.schema.object`) et applique à chaque accès les grants, les filtres de lignes, les masques de colonnes et les politiques ABAC (contrôle d'accès basé sur les attributs). Au-delà des tables, UC régit également les vues, les vues matérialisées, les volumes, les modèles, les index de recherche vectorielle et les fonctions enregistrées.

## Prérequis \{#prerequisites\}

- Databricks CLI `v1.0.0+` avec un [profil authentifié](/docs/tools/databricks-cli#authenticate).
- Une application AppKit en cours d'exécution. Voir [Démarrage rapide des Apps](/docs/apps/quickstart).
- Un SQL warehouse déclaré comme ressource d'application dans `databricks.yml`. Le service principal de votre application se voit automatiquement attribuer `CAN_USE` lorsque vous liez la ressource. Les permissions des utilisateurs finaux sont traitées [ci-dessous](#where-403s-come-from).

## Ce que lit le plugin Analytics \{#what-the-analytics-plugin-reads\}

Tous les objets UC résident dans un espace de noms `catalog.schema.object`. Les objets interrogés par ce plugin :

- **Tables** (Delta et Iceberg).
- **Vues** et **vues matérialisées**.
- **Tables de streaming**.
- **Fonctions** appelées avec `SELECT my_catalog.my_schema.my_function(...)`.

Les autres objets UC relèvent d'autres plugins. Les volumes (stockage de fichiers) passent par le [plugin Files](/docs/appkit/v0/plugins/files). La liste complète des objets UC figure dans [Securable objects](https://docs.databricks.com/aws/en/data-governance/unity-catalog/securable-objects).

## Brancher le plugin Analytics \{#wire-the-analytics-plugin\}

Enregistrez le plugin dans `createApp`. Il expose les endpoints Analytics et lit les requêtes depuis `config/queries/` pour les exécuter sur le SQL warehouse que vous associez dans `app.yaml`.

```typescript title="server/server.ts"
import { analytics, createApp, server } from "@databricks/appkit";

await createApp({
  plugins: [server(), analytics({})],
});
```

Associez le SQL warehouse dans `app.yaml` afin que la plateforme définisse `DATABRICKS_WAREHOUSE_ID` au démarrage :

```yaml title="app.yaml"
env:
  - name: DATABRICKS_WAREHOUSE_ID
    valueFrom: sql-warehouse
```

La ressource correspondante est déclarée dans `databricks.yml`. Consultez [Configuration de l&#39;application](/docs/apps/configuration#resources) pour la liste complète des ressources et les clés `valueFrom`.


## Rédiger les fichiers SQL \{#author-sql-files\}

Placez vos fichiers `.sql` dans `config/queries/`. Le nom du fichier, sans l&#39;extension `.sql`, devient la clé de la requête.

```sql title="config/queries/spend_summary.sql"
-- @param startDate DATE
-- @param endDate DATE
SELECT date_trunc('day', usage_date) AS day, SUM(usage_quantity) AS qty
FROM system.billing.usage
WHERE usage_date BETWEEN :startDate AND :endDate
GROUP BY 1
ORDER BY 1;
```

Le contexte d&#39;exécution est déterminé par le nom du fichier :

* `spend_summary.sql` s&#39;exécute sous l&#39;identité du **service principal de l&#39;application**. Le cache est partagé entre les utilisateurs.
* `spend_summary.obo.sql` s&#39;exécute sous l&#39;identité de l&#39;**utilisateur connecté**. Le cache est propre à chaque utilisateur. Unity Catalog applique les grants, les filtres de lignes, les masques de colonnes et les politiques ABAC de cet utilisateur.

Pour l&#39;API complète du plugin, y compris les types de paramètres et le streaming Arrow, consultez la [référence du plugin Analytics](/docs/appkit/v0/plugins/analytics).


## Afficher les données dans React avec `useAnalyticsQuery` \{#render-in-react-with-useanalyticsquery\}

```tsx title="client/src/SpendTable.tsx"
import { useMemo } from "react";
import { sql } from "@databricks/appkit-ui/js";
import { useAnalyticsQuery } from "@databricks/appkit-ui/react";

export function SpendTable() {
  const params = useMemo(
    () => ({
      startDate: sql.date("2025-01-01"),
      endDate: sql.date("2025-12-31"),
    }),
    [],
  );

  const { data, loading, error } = useAnalyticsQuery("spend_summary", params);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;
  return (
    <ul>
      {data?.map((row) => (
        <li key={row.day}>
          {row.day}: {row.qty}
        </li>
      ))}
    </ul>
  );
}
```

:::important[Encapsulez les paramètres dans useMemo]
`useAnalyticsQuery` relance la requête dès que la référence de ses paramètres change. Un objet déclaré en ligne crée une nouvelle référence à chaque rendu, ce qui provoque une boucle infinie. Encapsulez les paramètres dans `useMemo`.
:::


## D'où viennent les erreurs 403 \{#where-403s-come-from\}

L'identité associée à chaque requête est déterminée par le nom du fichier :

- **Les requêtes du service principal** (`*.sql`) utilisent le service principal de l'application. Le SP doit disposer du privilège `SELECT` sur les tables sous-jacentes. Les erreurs de permission renvoient un `403` depuis le warehouse.
- **Les requêtes on-behalf-of-user** (`*.obo.sql`) s'exécutent sous l'identité de l'utilisateur connecté. UC applique automatiquement ses grants. Si l'utilisateur ne dispose pas du privilège `SELECT`, ou si un filtre de lignes ou un masque de colonnes masque les données, l'appel renvoie un `403` ou moins de lignes. Vous n'avez pas à écrire la vérification des permissions.

:::note[L'autorisation on-behalf-of-user doit être activée]

Un administrateur du workspace doit activer l'autorisation on-behalf-of-user avant que des scopes puissent être ajoutés à votre application. Consultez [App authorization](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/auth) pour les détails de la plateforme.

:::

## Lakehouse Federation \{#lakehouse-federation\}

Lakehouse Federation fait apparaître les sources externes (Snowflake, BigQuery, Oracle, Redshift) comme des catalogues UC. Une fois enregistrées, elles se comportent, pour le plugin Analytics, comme n'importe quelle autre table UC : même référence `catalog.schema.table`, même fichier SQL, même OBO. Le warehouse délègue autant que possible les filtres et les agrégations à la source externe, puis lit les données restantes au moment de la requête, sans les conserver dans UC. Consultez [Lakehouse Federation](https://docs.databricks.com/aws/en/query-federation/) pour la liste des sources, la configuration et la couverture du pushdown par source.

## Requêtes en langage naturel \{#natural-language-queries\}

Pour les questions-réponses en langage naturel sur les tables UC (jeux de données curés, base de connaissances et système d'IA composite qui transforme les questions en SQL), utilisez [Genie](/docs/agents/genie). Pour un exemple de configuration fonctionnelle, consultez le modèle [Genie Conversational Analytics](/templates/genie-conversational-analytics). Le plugin Genie figure dans la section Agent Bricks, car il s'agit d'une intégration d'agent et non d'une intégration SQL.

## Et ensuite \{#where-to-next\}

Essayez [Set Up Unity Catalog with External Storage](/templates/unity-catalog-setup) pour provisionner un catalogue, ou [Volume File Manager](/templates/volume-file-upload) pour ajouter des UC Volumes à votre application. Explorez ensuite [Lakeflow Jobs](/docs/lakehouse/jobs) pour déclencher des traitements, ou [Pipelines and freshness](/docs/lakehouse/pipelines) pour les indicateurs de « dernière mise à jour ».