---
title: Que sont les modèles ?
sidebar_label: Que sont les modèles ?
description: Les modèles sont des prompts d'agent à copier-coller qui pilotent votre assistant de codage tout au long d'une tâche de développement Databricks, de la génération complète d'une application à l'ajout d'une fonctionnalité à une application existante.
---

# Que sont les modèles ? \{#what-are-templates\}

DevHub inclut une collection de [modèles](/templates) qui vous permettent de générer rapidement la structure d'une application Databricks.

Un **modèle** n'est rien d'autre qu'un prompt d'agent — un bloc de texte que vous collez dans votre assistant de codage (Cursor, Claude Code, Codex ou tout autre agent s'exécutant dans votre éditeur) et qui lui indique précisément comment construire un élément sur Databricks.

C'est l'assistant qui se charge de la construction à proprement parler. Il pose des questions de clarification, exécute la Databricks CLI, écrit le code et effectue le déploiement. Vous gardez la main sur les décisions de haut niveau, sans avoir à connaître ni à mémoriser la moindre commande.

## Comment utiliser un modèle \{#how-to-use-a-template\}

Chaque modèle de ce site comporte un bouton **Copier le prompt** en haut de la page.

1. Ouvrez un modèle sur [/templates](/templates) et choisissez celui qui correspond à ce que vous souhaitez créer.
2. Cliquez sur **Copier le prompt**, puis collez le résultat dans votre agent de codage.
3. L'agent lit le prompt, pose les questions nécessaires (quel workspace, quel catalogue, données réelles ou données de test, etc.), puis se met à construire.

## Les variantes \{#the-flavors\}

Il existe deux variantes de modèles : les modèles d'application de bout en bout et les modèles de tâche.

### Modèles d'application de bout en bout \{#end-to-end-app-templates\}

L'agent crée une application Databricks complète à partir de zéro : interface, serveur, ressources Databricks et étapes de déploiement inclus. Utilisez-les lorsque vous démarrez un nouveau projet et souhaitez obtenir une application fonctionnelle que vous pourrez adapter à votre cas d'usage.

Exemples :

- [App with Lakebase](/templates/app-with-lakebase) — une application CRUD reposant sur Postgres managé.
- [AI Chat App](/templates/ai-chat-app) — une application de chat avec réponses en streaming et historique de conversation persistant.
- [Vacation Rentals Operations Console](/templates/vacation-rentals) — une file d'attente de réservations avec des indicateurs et des notes d'agent stockés dans Lakebase, des analyses de revenus via SQL Warehouse et un panneau de chat Genie intégré.

Certains modèles de bout en bout incluent également une base de code de démarrage déployable, issue du dépôt Databricks [app-templates](https://github.com/databricks/app-templates). Le cas échéant, l'agent la clone comme point de départ et l'adapte à vos données, à votre workspace et à votre cas d'usage.

### Modèles de tâche \{#task-templates\}

L'agent réalise une tâche ciblée sur un projet existant. Utilisez ces modèles lorsque vous disposez déjà d'une application Databricks et souhaitez y ajouter un élément.

Exemples :

- [Onboard Your Coding Agent](/templates/onboard-your-coding-agent) — installez les compétences de la plateforme Databricks et le Docs MCP Server dans votre dépôt.
- [Lakebase Data Persistence](/templates/lakebase-data-persistence) — ajoutez un stockage Postgres managé à une application existante.
- [Create a Lakebase Project](/templates/lakebase-create-instance) — provisionnez un projet Lakebase et récupérez les valeurs de connexion.

Les modèles de tâche sont conçus pour se combiner. En enchaîner plusieurs suffit à passer d'un dépôt vide à une application déployée — c'est précisément ce que font les modèles de bout en bout en coulisses.

## Pour aller plus loin \{#where-to-go-next\}

- Parcourez le [catalogue de modèles](/templates) complet.
- Explorez plus en détail les services de la plateforme Databricks que vous pouvez utiliser pour créer votre application : [Databricks Apps](/docs/apps/overview), [Lakebase Postgres](/docs/lakebase/overview), [Agent Bricks](/docs/agents/overview) et le [Data Lakehouse](/docs/lakehouse/overview).