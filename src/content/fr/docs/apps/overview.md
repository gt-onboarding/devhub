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

# Qu&#39;est-ce que Databricks Apps ? \{#what-is-databricks-apps\}

Databricks Apps héberge votre application web directement dans votre workspace. Celle-ci bénéficie d&#39;une URL fixe, d&#39;une authentification OAuth intégrée et d&#39;un accès direct aux données et services de votre workspace. Pas de service d&#39;hébergement distinct, pas de couche d&#39;authentification à développer, pas de rotation d&#39;identifiants à gérer.

**[AppKit](/fr/docs/appkit/v0)** est le SDK TypeScript qui permet de créer ces applications. Il fournit des composants d&#39;interface React prêts à l&#39;emploi, un accès aux données typé et un système de plugins pour se connecter aux services Databricks.

## Fonctionnement \{#how-it-works\}

AppKit repose sur une architecture à trois couches, avec des plugins qui enregistrent des fonctionnalités à chaque niveau :

* **Client** : frontend React servi par Vite. Le package `@databricks/appkit-ui` fournit des tables de données, des graphiques, des boîtes de dialogue et des composants de mise en page.
* **Serveur** : serveur HTTP Express avec l&#39;authentification Databricks OAuth intégrée. Les plugins y rattachent des routes et des middlewares.
* **Données** : accès aux ressources Databricks via des plugins. Chaque plugin encapsule un type de ressource et expose une API typée sur l&#39;objet `AppKit`.

| Plugin                                               | Ce qu&#39;il apporte                                                                                                                                                                  |
| ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [**server**](/fr/docs/appkit/v0/plugins/server)         | Serveur HTTP Express, service de fichiers statiques, mode développement Vite (toujours inclus)                                                                                 |
| [**lakebase**](/fr/docs/appkit/v0/plugins/lakebase)     | Pool de connexions Postgres pour [Lakebase Postgres](/fr/docs/lakebase/quickstart) avec actualisation automatique des jetons OAuth                                                |
| [**analytics**](/fr/docs/appkit/v0/plugins/analytics)   | Exécution de requêtes SQL sur les [SQL warehouses Databricks](https://docs.databricks.com/aws/en/compute/sql-warehouse/). Voir [Lectures analytiques](/fr/docs/lakehouse/analytical-reads). |
| [**genie**](/fr/docs/appkit/v0/plugins/genie)           | Intégration de [Genie Agent](/fr/docs/agents/genie) pour interroger les données en langage naturel                                                                                |
| [**serving**](/fr/docs/appkit/v0/plugins/model-serving) | Proxy authentifié vers les endpoints [Model Serving](/fr/docs/agents/ai-gateway), avec prise en charge du streaming                                                                |
| [**files**](/fr/docs/appkit/v0/plugins/files)           | Opérations sur les fichiers des [volumes Unity Catalog](https://docs.databricks.com/aws/en/files/)                                                                              |
| [**agents**](/fr/docs/appkit/v0/plugins/agents)         | Agents IA définis en markdown ou en code, avec découverte automatique des outils                                                                                                |
| [**ai-search**](/fr/docs/appkit/v0/plugins/ai-search)   | Recherche sémantique et vectorielle sur vos index AI Search                                                                                                                     |
| [**jobs**](/fr/docs/appkit/v0/plugins/jobs)             | Déclenchement et suivi des [Lakeflow Jobs Databricks](/fr/docs/lakehouse/jobs)                                                                                                     |
| [**caching**](/fr/docs/appkit/v0/plugins/caching)       | Mise en cache des réponses au niveau global et par plugin, s&#39;appuyant sur [Lakebase Postgres](/fr/docs/lakebase/quickstart) lorsqu&#39;il est disponible                               |

Pour consulter l&#39;ensemble des plugins actuellement disponibles, voir la [référence des plugins](/fr/docs/appkit/v0/plugins).

## Fonctionnement de l&#39;authentification \{#how-auth-works\}

Chaque app dispose d&#39;un service principal dédié. Databricks injecte ses identifiants au runtime, ce qui permet à votre app d&#39;appeler les API du workspace sans avoir à gérer de jetons.

Par défaut, toutes les requêtes s&#39;exécutent sous ce service principal, et tous les utilisateurs partagent ses permissions. Si vous avez besoin d&#39;un accès aux données propre à chaque utilisateur, Databricks peut transmettre le jeton de l&#39;utilisateur connecté via `x-forwarded-access-token`. Les plugins [Genie](/fr/docs/agents/genie) et [Model Serving](/fr/docs/agents/ai-gateway) intégrés à AppKit s&#39;en chargent automatiquement.

## Quand l&#39;utiliser \{#when-to-use-it\}

Les apps sont avant tout affaire d&#39;**interactivité**, pas seulement d&#39;analytique. Un tableau de bord est idéal pour des vues en lecture seule avec des filtres prédéfinis. Une app fait la même chose, mais accepte en plus des saisies, exécute de la logique et conserve les résultats. Créez une app dès que votre flux de travail requiert l&#39;un de ces éléments : par exemple un générateur de scénarios qui enregistre les cas créés par les utilisateurs, ou un outil interne remplaçant un processus manuel sur tableur.

## Quand ne pas l&#39;utiliser \{#when-not-to-use-it\}

* **Sites statiques sans accès aux données Databricks.** Hébergez-les où vous voulez.
* **Applications publiques ou destinées aux clients.** Par défaut, les utilisateurs doivent être des identités authentifiées dans votre compte Databricks (sans nécessairement appartenir au workspace de l&#39;application). Pour un accès externe ou destiné aux clients, consultez [App Users](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/key-concepts#app-users).
* **Tableaux de bord purement en lecture seule** déjà couverts par les [Dashboards](https://docs.databricks.com/aws/en/dashboards/) AI/BI. Utilisez un tableau de bord tant que vous n&#39;avez pas besoin de conserver les saisies des utilisateurs ou d&#39;y ajouter une logique personnalisée.

## Et ensuite ? \{#where-to-next\}

Les [modèles](/fr/templates) sont des prompts prêts à l&#39;emploi pour les agents, organisés par cas d&#39;usage. Trouvez celui qui correspond à votre besoin, ou consultez le [Démarrage rapide Apps](/fr/docs/apps/quickstart) pour un guide pas à pas.