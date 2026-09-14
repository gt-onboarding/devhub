---
title: Démarrage rapide
sourceOfTruth:
  skills:
    - databricks-apps
    - databricks-lakebase
  docs:
    - /docs/appkit/v0
    - https://docs.databricks.com/aws/en/oltp/
---

# Démarrage rapide \{#quickstart\}

## Prérequis \{#prerequisites\}

- Databricks CLI `v1.0.0+` avec un [profil authentifié](/docs/tools/databricks-cli#authenticate)
- `psql` (client PostgreSQL) si vous utilisez `databricks psql`. Vous pouvez également utiliser [`generate-database-credential`](/docs/lakebase/development#local-database-access) avec n'importe quel client PostgreSQL.
- Un workspace avec l'accès à Lakebase Postgres activé

## Chemin des modèles \{#template-path\}

Parcourez les modèles ci-dessous, choisissez celui qui correspond à votre cas d'usage et copiez-le dans votre assistant de codage IA. Chacun inclut la ressource [Create a Lakebase Project](/templates/lakebase-create-instance), qui guide la création du projet et la collecte des valeurs de connexion.

| Modèle                                                              | Idéal pour                                                     |
| ------------------------------------------------------------------- | -------------------------------------------------------------- |
| [App with Lakebase](/templates/app-with-lakebase)                   | Applications CRUD avec stockage persistant                     |
| [AI Chat App](/templates/ai-chat-app)                               | IA conversationnelle avec historique des conversations          |
| [Operational Data Analytics](/templates/operational-data-analytics) | Synchronisation bidirectionnelle entre Lakebase Postgres et Unity Catalog |

## Personnaliser votre application \{#customize-your-app\}

Après avoir déployé une application adossée à Lakebase Postgres, envisagez les personnalisations suivantes :

- **Ajouter des tables** : suivez le modèle [Lakebase Data Persistence](/templates/lakebase-data-persistence) pour définir des schémas, générer des types et créer des routes CRUD.
- **Ajouter une mémoire d'agent** : utilisez le modèle [Lakebase Agent Memory](/templates/lakebase-agent-memory) pour conserver les conversations de votre agent.
- **Utiliser des branches de fonctionnalités** : créez des branches isolées pour le développement et les tests. La section [Développement : branches de fonctionnalités](/docs/lakebase/development#feature-branches) répertorie les commandes CLI.
- **Synchroniser des données depuis/vers Unity Catalog** : utilisez [Lakebase Change Data Feed (CDF)](/templates/lakebase-change-data-feed-autoscaling) pour répliquer les tables Lakebase Postgres dans Delta, ou [Sync Tables](/templates/sync-tables-autoscaling) pour exposer les données d'Unity Catalog via Lakebase.
- **Déployer en dehors de Databricks** : utilisez le modèle [Lakebase Off-Platform](/templates/lakebase-off-platform) pour les applications hébergées sur AWS, Vercel, Netlify et d'autres plateformes.

## Parcours manuel \{#manual-path\}

Lorsque vous générez un projet sans modèle, `databricks apps init` produit un projet AppKit fonctionnel. Vous devez d&#39;abord disposer d&#39;un projet Lakebase. Créez-en un :

```bash
databricks postgres create-project <project-id>
```

L&#39;identifiant devient le nom de ressource du projet (`projects/<project-id>`). Pour une configuration guidée incluant les branches et les valeurs de connexion, consultez le modèle [Create a Lakebase Project](/templates/lakebase-create-instance) ou la compétence d&#39;agent [`databricks-lakebase`](/docs/tools/ai-tools/agent-skills).

**Interactif** (recommandé pour le développement local) : exécutez la commande sans options.

```bash
databricks apps init
```

La CLI vous demande le nom de votre application, puis affiche la liste des plugins (fonctionnalités) disponibles. Sélectionnez **Lakebase** : elle vous guide ensuite dans le choix d&#39;un projet Lakebase, d&#39;une branch et d&#39;une base de données existants.

**Mode non interactif** (pour les scripts et la CI) : passez `--name` ainsi que les champs `--set` requis pour chaque fonctionnalité de plugin sélectionnée. La valeur `database` doit être le chemin de ressource complet, récupéré via `databricks postgres list-databases projects/<project-id>/branches/<branch-id> -o json` (utilisez le champ `name`) :

```bash
databricks apps init --name my-app --features lakebase \
  --set lakebase.postgres.project=projects/<project-id> \
  --set lakebase.postgres.branch=projects/<project-id>/branches/<branch-id> \
  --set lakebase.postgres.database=projects/<project-id>/branches/<branch-id>/databases/<database-id>
```

Déployez ensuite une première fois pour créer les schémas, puis exécutez l&#39;application en local :

```bash
cd my-app
databricks apps deploy
```

:::tip
Exécutez `databricks apps deploy` avant `npm run dev`. Le déploiement met en place une identité gérée (le service principal de l&#39;application) qui crée le schéma de base de données au premier démarrage. Si vous lancez `npm run dev` en premier, le schéma sera créé avec vos identifiants personnels et, lors du déploiement ultérieur, l&#39;identité gérée de l&#39;application ne pourra pas y accéder. La page [Configuration locale](/docs/lakebase/development#local-setup) détaille ce point.
:::

```bash
npm install && npm run dev
```

## Et ensuite \{#where-to-next\}

Pour le workflow de développement local, les branches de fonctionnalités et l'API complète du plugin, consultez [Développement avec Lakebase Postgres](/docs/lakebase/development).