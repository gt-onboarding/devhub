---
title: Qu'est-ce qu'Agent Bricks ?
sidebar_label: Vue d'ensemble
description: Agent Bricks est la plateforme d'agents d'entreprise de Databricks. Elle unifie l'accès aux modèles, l'exécution, la gouvernance et le contexte métier pour permettre aux équipes de créer, déployer et gouverner des agents en production.
sourceOfTruth:
  skills:
    - databricks-agent-bricks
  docs:
    - /docs/appkit/v0
    - https://docs.databricks.com/aws/en/agents/agent-bricks/
  note: "L'essentiel de cette page relève du cadrage AppKit géré par DevHub. Le produit Agent Bricks, lui, relève de la skill databricks-agent-bricks et de la documentation canonique."
---

# Qu&#39;est-ce qu&#39;Agent Bricks ? \{#what-is-agent-bricks\}

**Agent Bricks** est la plateforme d&#39;agents d&#39;entreprise de Databricks, conçue pour créer, déployer et gouverner des agents qui exploitent vos données métier. Elle réunit au sein d&#39;un même système l&#39;accès aux modèles, l&#39;exécution, la gouvernance et le contexte : du modèle que vous appelez aux données que votre agent consulte, en passant par l&#39;identité sous laquelle il agit. Dans votre workspace, vous configurez des Knowledge Assistants, des Supervisor Agents et des agents Python personnalisés. Databricks se charge de l&#39;évaluation, de l&#39;optimisation et de l&#39;amélioration de la qualité, puis héberge chaque agent derrière un endpoint HTTP que votre application peut appeler.

Pour en savoir plus sur Agent Bricks et sur la façon de développer avec, consultez la [documentation Agent Bricks](https://docs.databricks.com/aws/en/agents/agent-bricks/) ou la compétence d&#39;agent [`databricks-agent-bricks`](/fr/docs/tools/ai-tools/agent-skills).

Votre application AppKit se connecte aux fonctionnalités d&#39;Agent Bricks via le [plugin Model Serving](/fr/docs/appkit/v0/plugins/model-serving) pour les agents, les foundation models et les endpoints gouvernés, et via le [plugin Genie](/fr/docs/appkit/v0/plugins/genie) pour les requêtes en langage naturel sur les tables Unity Catalog.

## Comment tout s&#39;articule \{#how-it-fits-together\}

Votre application AppKit appelle Agent Bricks via un **endpoint Model Serving** (un foundation model, un Knowledge Assistant, un Supervisor Agent ou un agent Python personnalisé) ou un **Genie Agent** (requêtes en langage naturel sur des tables Unity Catalog). Le [plugin Model Serving](/fr/docs/appkit/v0/plugins/model-serving) et le [plugin Genie](/fr/docs/appkit/v0/plugins/genie) couvrent ces deux cas.

```mermaid
flowchart LR
    React["React<br/>(@databricks/appkit-ui/react)"] -->|"useServingStream /<br/>useGenieChat"| Node["Serveur AppKit<br/>(@databricks/appkit)"]
    Node -->|"Plugin Model Serving"| Endpoint["Endpoint Model Serving<br/>(LLM, Knowledge Assistant,<br/>Supervisor Agent,<br/>Python personnalisé)"]
    Node -->|"Plugin Genie"| Space["Genie Agent"]
    Endpoint --> Gateway["Unity AI Gateway<br/>(gouvernance, limites de débit,<br/>tables système)"]
    Space --> UC["Unity Catalog<br/>tables"]
```

## Plugins AppKit pour Agent Bricks \{#appkit-plugins-for-agent-bricks\}

| Votre objectif                                                                              | Plugin à utiliser | Utilitaire frontend                    |
| ------------------------------------------------------------------------------------------- | --------------- | -------------------------------------- |
| Appeler un foundation model (LLM) avec des messages de chat                                 | `serving`       | `useServingStream`, `useServingInvoke` |
| Appeler un endpoint d&#39;agent (Knowledge Assistant, Supervisor Agent, Python personnalisé)    | `serving`       | `useServingStream`, `useServingInvoke` |
| Permettre aux utilisateurs d&#39;interroger les tables Unity Catalog en langage naturel          | `genie`         | `GenieChat`, `useGenieChat`            |

Choisissez le plugin correspondant à la ressource. Aucune autre primitive n&#39;est nécessaire pour la couche IA.

## Auth \{#auth\}

Les routes HTTP de serving et de Genie s&#39;exécutent par défaut au nom de l&#39;utilisateur authentifié. Si l&#39;utilisateur ne dispose pas du droit `CAN QUERY` sur l&#39;endpoint de serving ou `CAN RUN` sur le Genie Agent, l&#39;appel échoue avec une erreur 403. Vous n&#39;avez pas à écrire la vérification des permissions.

Pour la logique serveur en dehors d&#39;un gestionnaire de route, appelez `AppKit.serving("alias").asUser(req).invoke(...)` afin de conserver le même comportement.

## Pourquoi AppKit plutôt qu&#39;un `fetch` brut \{#why-appkit-instead-of-raw-fetch\}

Vous pourriez appeler un endpoint de serving directement avec `fetch` et un jeton. Le plugin ne fait rien que vous ne puissiez faire vous-même : il le fait simplement à votre place :

* Les routes s&#39;exécutent en tant qu&#39;utilisateur authentifié, si bien que les **permissions par utilisateur** s&#39;appliquent automatiquement. Vos utilisateurs ne voient que les endpoints et les données auxquels ils ont déjà accès. Aucun code OAuth de votre côté. Voir [Contexte d&#39;exécution](/fr/docs/appkit/v0/plugins/execution-context) pour les détails.
* Tout le **streaming** est géré pour vous : analyse SSE, interruption au démontage, accumulation des jetons et gestion des erreurs. `useServingStream` et `useGenieChat` s&#39;en chargent.
* Aucun **secret** dans le frontend. Le plugin relaie les requêtes via votre serveur et les jetons restent côté backend. Pas de PAT dans le bundle React.
* Lorsque votre endpoint de serving publie un schéma OpenAPI, AppKit génère des **alias d&#39;endpoint typés**, avec des types TypeScript pour la requête et la réponse de chaque alias. De l&#39;autocomplétion sur la forme des chunks, au lieu de `unknown`.

:::note[Créer un custom agent]

Créer un custom agent relève d&#39;un workflow Python : l&#39;interface `ResponsesAgent`, un framework d&#39;agents (OpenAI Agents SDK, LangGraph, LlamaIndex) et MLflow pour le tracing. Voir [Author an AI agent](https://docs.databricks.com/aws/en/agents/custom-agents/author-agent).

:::

## Choisissez un modèle de départ \{#pick-a-template-to-start-from\}

Partez d&#39;un modèle correspondant à votre cas d&#39;usage. Chacun intègre la configuration du plugin Model Serving ou Genie, une liaison de ressource dans `app.yaml` et une interface fonctionnelle que vous pouvez adapter.

| Vous souhaitez...                                                     | Modèle                                                     |
| ------------------------------------------------------------------ | ---------------------------------------------------------- |
| Ajouter un chatbot en streaming à votre application                | [AI Chat App](/fr/templates/ai-chat-app)                      |
| Permettre aux utilisateurs d&#39;interroger des tables en langage naturel | [Genie Analytics App](/fr/templates/genie-analytics-app)      |
| Ajouter le changement d&#39;agent Genie à une application existante  | [Genie Multi-Agent Selector](/fr/templates/genie-multi-space) |

## Pour aller plus loin \{#where-to-next\}

* [Unity AI Gateway](/fr/docs/agents/ai-gateway) pour un accès gouverné aux modèles, aux endpoints d&#39;agents et aux outils externes.
* [Genie Agents](/fr/docs/agents/genie) pour dialoguer avec vos données dans les tables Unity Catalog.
* [Endpoints d&#39;agents personnalisés](/fr/docs/agents/custom-agents) pour connecter un Knowledge Assistant, un Supervisor Agent ou votre propre agent Python.