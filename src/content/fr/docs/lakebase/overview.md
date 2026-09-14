---
title: Qu'est-ce que Lakebase Postgres ?
sidebar_label: Vue d'ensemble
description: Lakebase Postgres est un service Postgres géré au sein de Databricks, colocalisé avec votre Lakehouse. Stockage OLTP avec création de branches instantanée et autoscaling.
sourceOfTruth:
  skills:
    - databricks-lakebase
  docs:
    - /docs/appkit/v0/plugins/lakebase
    - https://docs.databricks.com/aws/en/oltp/
---

# Qu&#39;est-ce que Lakebase Postgres ? \{#what-is-lakebase-postgres\}

Lakebase Postgres est un service PostgreSQL géré qui s&#39;exécute au sein de votre workspace Databricks, colocalisé avec les données et les services de ce workspace.

Utilisez-le pour les données que vos applications écrivent et lisent en continu avec une faible latence : état utilisateur, sessions, historique des conversations et journaux, stockés aux côtés de vos données analytiques dans le Lakehouse.

Cette page présente Lakebase du point de vue d&#39;AppKit. Pour Lakebase Postgres à proprement parler (projets, création de branches, autoscaling, connectivité), consultez la [documentation Lakebase](https://docs.databricks.com/aws/en/oltp/) ou l&#39;agent skill [`databricks-lakebase`](/fr/docs/tools/ai-tools/agent-skills).

## Ce qui le distingue d&#39;un Postgres que vous hébergez vous-même \{#what-makes-it-different-from-running-your-own-postgres\}

* **Fonctionne au sein de votre workspace**, ce qui élimine l&#39;appairage de VPC, la gestion d&#39;identifiants entre clouds et la latence réseau.
* **Branches instantanées** : le stockage en copie sur écriture crée des copies isolées de la base en quelques secondes, à la manière des branches git. Les branches partagent les données inchangées, ce qui les rend peu coûteuses à créer et à maintenir.
* **Mise à l&#39;échelle automatique** selon votre charge de travail : le système monte en charge en cas de pic puis redescend lorsque la demande diminue, dans une plage min/max configurée. Aucune planification de capacité ni redimensionnement manuel.
* **Mise à l&#39;échelle à zéro** en période d&#39;inactivité, avec reprise dès la requête suivante. Aucun coût pour le compute inactif. Le délai d&#39;inactivité est de 24 heures par défaut et peut être défini entre 60 secondes et 7 jours.

## Comment AppKit gère la connexion \{#how-appkit-wires-it-up\}

Ajoutez le plugin `lakebase()` à `createApp` : le plugin met alors en place un `pg.Pool` avec rafraîchissement automatique du jeton OAuth :

```typescript
import { createApp, lakebase, server } from "@databricks/appkit";

const AppKit = await createApp({
  plugins: [server(), lakebase()],
});

// Requête pg.Pool standard
const { rows } = await AppKit.lakebase.query("SELECT * FROM app.items");

// Configuration prête à l'emploi pour un ORM (Drizzle, Prisma, etc.)
const ormConfig = AppKit.lakebase.getOrmConfig();
```

Le plugin gère automatiquement le renouvellement des jetons OAuth et le pooling des connexions. Une fois l&#39;application déployée, la plateforme injecte les valeurs de connexion sous forme de variables d&#39;environnement, que le plugin lit directement. Aucune configuration manuelle n&#39;est nécessaire. La [référence du plugin `lakebase` d&#39;AppKit](/fr/docs/appkit/v0/plugins/lakebase) détaille les options de configuration du pool ainsi que l&#39;API complète.

## Quand l&#39;utiliser \{#when-to-use-it\}

* Votre application a besoin de lectures et d&#39;écritures à faible latence : état utilisateur, sessions, historique de conversation ou enregistrements transactionnels.
* Vous développez des agents IA nécessitant une mémoire persistante : historique de conversation, état de workflow ou résultats d&#39;outils conservés d&#39;une requête à l&#39;autre.
* Vous souhaitez disposer de branches de base de données isolées pour le développement de fonctionnalités ou les tests CI.
* Vous synchronisez des données entre votre charge de travail OLTP et le [Data Lakehouse](/fr/docs/lakehouse/overview) par capture des données modifiées (CDC).

## Quand ne pas l&#39;utiliser \{#when-not-to-use-it\}

* Analytique pure : les requêtes en lecture seule sur de grands jeux de données relèvent d&#39;Unity Catalog, pas de Lakebase Postgres.
* Applications sans autre dépendance à un workspace Databricks : l&#39;avantage de la colocalisation ne joue plus, et l&#39;authentification devient votre responsabilité (Databricks n&#39;injecte pas d&#39;identifiants et ne rafraîchit pas les jetons des applications exécutées en dehors du workspace).

## Et ensuite ? \{#where-to-next\}

Les [modèles](/fr/templates) sont des prompts prêts à l&#39;emploi pour les agents, organisés par cas d&#39;usage. Trouvez celui qui correspond à votre besoin, ou consultez le [guide de démarrage rapide Lakebase Postgres](/fr/docs/lakebase/quickstart) pour des instructions pas à pas.