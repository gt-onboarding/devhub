---
title: Que sont les modèles ?
sidebar_label: Que sont les modèles ?
description: Les modèles sont des prompts d'agent à copier-coller qui pilotent votre assistant de codage tout au long d'une tâche de développement Databricks, de la génération complète d'une application à l'ajout d'une fonctionnalité à une application existante.
---

# Que sont les modèles ? \{#what-are-templates\}

DevHub inclut une collection de [modèles](/fr/templates) qui vous permettent de générer rapidement la structure d&#39;une application Databricks.

Un **modèle** n&#39;est rien d&#39;autre qu&#39;un prompt d&#39;agent — un bloc de texte que vous collez dans votre assistant de codage (Cursor, Claude Code, Codex ou tout autre agent s&#39;exécutant dans votre éditeur) et qui lui indique précisément comment construire un élément sur Databricks.

C&#39;est l&#39;assistant qui se charge de la construction à proprement parler. Il pose des questions de clarification, exécute la Databricks CLI, écrit le code et effectue le déploiement. Vous gardez la main sur les décisions de haut niveau, sans avoir à connaître ni à mémoriser la moindre commande.

## Comment utiliser un modèle \{#how-to-use-a-template\}

Chaque modèle de ce site comporte un bouton **Copier le prompt** en haut de la page.

1. Ouvrez un modèle sur [/templates](/fr/templates) et choisissez celui qui correspond à ce que vous souhaitez créer.
2. Cliquez sur **Copier le prompt**, puis collez le résultat dans votre agent de codage.
3. L&#39;agent lit le prompt, pose les questions nécessaires (quel workspace, quel catalogue, données réelles ou données de test, etc.), puis se met à construire.

## Les variantes \{#the-flavors\}

Il existe deux variantes de modèles : les modèles d&#39;application de bout en bout et les modèles de tâche.

### Modèles d&#39;application de bout en bout \{#end-to-end-app-templates\}

L&#39;agent crée une application Databricks complète à partir de zéro : interface, serveur, ressources Databricks et étapes de déploiement inclus. Utilisez-les lorsque vous démarrez un nouveau projet et souhaitez obtenir une application fonctionnelle que vous pourrez adapter à votre cas d&#39;usage.

Exemples :

* [App with Lakebase](/fr/templates/app-with-lakebase) — une application CRUD reposant sur Postgres managé.
* [AI Chat App](/fr/templates/ai-chat-app) — une application de chat avec réponses en streaming et historique de conversation persistant.
* [Vacation Rentals Operations Console](/fr/templates/vacation-rentals) — une file d&#39;attente de réservations avec des indicateurs et des notes d&#39;agent stockés dans Lakebase, des analyses de revenus via SQL Warehouse et un panneau de chat Genie intégré.

Certains modèles de bout en bout incluent également une base de code de démarrage déployable, issue du dépôt Databricks [app-templates](https://github.com/databricks/app-templates). Le cas échéant, l&#39;agent la clone comme point de départ et l&#39;adapte à vos données, à votre workspace et à votre cas d&#39;usage.

### Modèles de tâche \{#task-templates\}

L&#39;agent réalise une tâche ciblée sur un projet existant. Utilisez ces modèles lorsque vous disposez déjà d&#39;une application Databricks et souhaitez y ajouter un élément.

Exemples :

* [Onboard Your Coding Agent](/fr/templates/onboard-your-coding-agent) — installez les compétences de la plateforme Databricks et le Docs MCP Server dans votre dépôt.
* [Lakebase Data Persistence](/fr/templates/lakebase-data-persistence) — ajoutez un stockage Postgres managé à une application existante.
* [Create a Lakebase Project](/fr/templates/lakebase-create-instance) — provisionnez un projet Lakebase et récupérez les valeurs de connexion.

Les modèles de tâche sont conçus pour se combiner. En enchaîner plusieurs suffit à passer d&#39;un dépôt vide à une application déployée — c&#39;est précisément ce que font les modèles de bout en bout en coulisses.

## Pour aller plus loin \{#where-to-go-next\}

* Parcourez le [catalogue de modèles](/fr/templates) complet.
* Explorez plus en détail les services de la plateforme Databricks que vous pouvez utiliser pour créer votre application : [Databricks Apps](/fr/docs/apps/overview), [Lakebase Postgres](/fr/docs/lakebase/overview), [Agent Bricks](/fr/docs/agents/overview) et le [Data Lakehouse](/fr/docs/lakehouse/overview).