---
title: Qu'est-ce que Databricks Apps ?
sidebar_label: Vue d'ensemble
description: Databricks Apps héberge des applications web dans votre workspace, avec authentification intégrée, compute managé et accès direct à vos données.
sourceOfTruth:
  skills:
    - databricks-apps
  docs:
    - /docs/appkit/v0
    - https://docs.databricks.com/aws/en/dev-tools/databricks-apps/
  note: "AppKit (le SDK TypeScript) est documenté sur DevHub et dans la compétence databricks-apps. docs.databricks.com couvre la plateforme Apps (déploiement, authentification, runtime), mais pas AppKit."
---

# Qu'est-ce que Databricks Apps ? \{#what-is-databricks-apps\}

Databricks Apps héberge votre application web directement dans votre workspace. Celle-ci bénéficie d'une URL fixe, d'une authentification OAuth intégrée et d'un accès direct aux données et services de votre workspace. Pas de service d'hébergement distinct, pas de couche d'authentification à développer, pas de rotation d'identifiants à gérer.

**[AppKit](/docs/appkit/v0)** est le SDK TypeScript qui permet de créer ces applications. Il fournit des composants d'interface React prêts à l'emploi, un accès aux données typé et un système de plugins pour se connecter aux services Databricks.

## Fonctionnement \{#how-it-works\}

AppKit repose sur une architecture à trois couches, avec des plugins qui enregistrent des fonctionnalités à chaque niveau :

- **Client** : frontend React servi par Vite. Le package `@databricks/appkit-ui` fournit des tables de données, des graphiques, des boîtes de dialogue et des composants de mise en page.
- **Serveur** : serveur HTTP Express avec l'authentification Databricks OAuth intégrée. Les plugins y rattachent des routes et des middlewares.
- **Données** : accès aux ressources Databricks via des plugins. Chaque plugin encapsule un type de ressource et expose une API typée sur l'objet `AppKit`.

| Plugin                                               | Ce qu'il apporte                                                                                                                                                                  |
| ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [**server**](/docs/appkit/v0/plugins/server)         | Serveur HTTP Express, service de fichiers statiques, mode développement Vite (toujours inclus)                                                                                 |
| [**lakebase**](/docs/appkit/v0/plugins/lakebase)     | Pool de connexions Postgres pour [Lakebase Postgres](/docs/lakebase/quickstart) avec actualisation automatique des jetons OAuth                                                |
| [**analytics**](/docs/appkit/v0/plugins/analytics)   | Exécution de requêtes SQL sur les [SQL warehouses Databricks](https://docs.databricks.com/aws/en/compute/sql-warehouse/). Voir [Lectures analytiques](/docs/lakehouse/analytical-reads). |
| [**genie**](/docs/appkit/v0/plugins/genie)           | Intégration de [Genie Agent](/docs/agents/genie) pour interroger les données en langage naturel                                                                                |
| [**serving**](/docs/appkit/v0/plugins/model-serving) | Proxy authentifié vers les endpoints [Model Serving](/docs/agents/ai-gateway), avec prise en charge du streaming                                                                |
| [**files**](/docs/appkit/v0/plugins/files)           | Opérations sur les fichiers des [volumes Unity Catalog](https://docs.databricks.com/aws/en/files/)                                                                              |
| [**agents**](/docs/appkit/v0/plugins/agents)         | Agents IA définis en markdown ou en code, avec découverte automatique des outils                                                                                                |
| [**ai-search**](/docs/appkit/v0/plugins/ai-search)   | Recherche sémantique et vectorielle sur vos index AI Search                                                                                                                     |
| [**jobs**](/docs/appkit/v0/plugins/jobs)             | Déclenchement et suivi des [Lakeflow Jobs Databricks](/docs/lakehouse/jobs)                                                                                                     |
| [**caching**](/docs/appkit/v0/plugins/caching)       | Mise en cache des réponses au niveau global et par plugin, s'appuyant sur [Lakebase Postgres](/docs/lakebase/quickstart) lorsqu'il est disponible                               |

Pour consulter l'ensemble des plugins actuellement disponibles, voir la [référence des plugins](/docs/appkit/v0/plugins).

## Fonctionnement de l'authentification \{#how-auth-works\}

Chaque app dispose d'un service principal dédié. Databricks injecte ses identifiants au runtime, ce qui permet à votre app d'appeler les API du workspace sans avoir à gérer de jetons.

Par défaut, toutes les requêtes s'exécutent sous ce service principal, et tous les utilisateurs partagent ses permissions. Si vous avez besoin d'un accès aux données propre à chaque utilisateur, Databricks peut transmettre le jeton de l'utilisateur connecté via `x-forwarded-access-token`. Les plugins [Genie](/docs/agents/genie) et [Model Serving](/docs/agents/ai-gateway) intégrés à AppKit s'en chargent automatiquement.

## Quand l'utiliser \{#when-to-use-it\}

Les apps sont avant tout affaire d'**interactivité**, pas seulement d'analytique. Un tableau de bord est idéal pour des vues en lecture seule avec des filtres prédéfinis. Une app fait la même chose, mais accepte en plus des saisies, exécute de la logique et conserve les résultats. Créez une app dès que votre flux de travail requiert l'un de ces éléments : par exemple un générateur de scénarios qui enregistre les cas créés par les utilisateurs, ou un outil interne remplaçant un processus manuel sur tableur.

## Quand ne pas l'utiliser \{#when-not-to-use-it\}

- **Sites statiques sans accès aux données Databricks.** Hébergez-les où vous voulez.
- **Applications publiques ou destinées aux clients.** Par défaut, les utilisateurs doivent être des identités authentifiées dans votre compte Databricks (sans nécessairement appartenir au workspace de l'application). Pour un accès externe ou destiné aux clients, consultez [App Users](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/key-concepts#app-users).
- **Tableaux de bord purement en lecture seule** déjà couverts par les [Dashboards](https://docs.databricks.com/aws/en/dashboards/) AI/BI. Utilisez un tableau de bord tant que vous n'avez pas besoin de conserver les saisies des utilisateurs ou d'y ajouter une logique personnalisée.

## Et ensuite ? \{#where-to-next\}

Les [modèles](/templates) sont des prompts prêts à l'emploi pour les agents, organisés par cas d'usage. Trouvez celui qui correspond à votre besoin, ou consultez le [Démarrage rapide Apps](/docs/apps/quickstart) pour un guide pas à pas.