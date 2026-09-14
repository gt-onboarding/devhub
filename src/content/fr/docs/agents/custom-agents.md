---
title: Endpoints d'agents personnalisés
sidebar_label: Agents personnalisés
description: Appelez un Knowledge Assistant, un Supervisor Agent ou un custom Python agent depuis votre application AppKit. Connectez-les au plugin Model Serving, quel qu'il soit.
sourceOfTruth:
  skills:
    - databricks-agent-bricks
  docs:
    - /docs/appkit/v0/plugins/model-serving
    - https://docs.databricks.com/aws/en/agents/agent-bricks/
    - https://docs.databricks.com/aws/en/agents/custom-agents/author-agent
  note: "databricks-agent-bricks couvre les builders Knowledge Assistant et Supervisor. La création de custom Python agents est uniquement documentée (pas encore de skill)."
---

# Endpoints d&#39;agents personnalisés \{#custom-agent-endpoints\}

Lorsque votre application AppKit a besoin de plus qu&#39;une réponse de foundation model ou qu&#39;une requête de données de type Genie, vous faites appel à un **custom agent** : un LLM façonné par des instructions, des outils, un ancrage documentaire ou une orchestration multi-agents. Vous pouvez en exécuter un depuis AppKit de deux façons :

* **Exécutez-le directement dans votre application** avec le [plugin `agents`](/fr/docs/appkit/v0/plugins/agents). Vous définissez l&#39;agent en code ou en markdown, ou vous exécutez un Supervisor managé via l&#39;adaptateur Supervisor API, sans avoir à déployer d&#39;endpoint distinct. Privilégiez cette approche pour un nouvel agent que vous développez vous-même.
* **Appelez un agent déjà exposé sous forme d&#39;endpoint de serving** avec le [plugin Model Serving](/fr/docs/appkit/v0/plugins/model-serving). Utilisez cette approche pour un Knowledge Assistant, ou pour tout agent déjà déployé en tant qu&#39;endpoint partagé.

## Prérequis \{#prerequisites\}

* Databricks CLI `v1.0.0+` avec un [profil authentifié](/fr/docs/tools/databricks-cli#authenticate).
* Une application AppKit en cours d&#39;exécution. Consultez le [démarrage rapide Apps](/fr/docs/apps/quickstart).
* Pour l&#39;approche par endpoint décrite ci-dessous, un agent déjà déployé en tant qu&#39;endpoint de serving.

## Exécuter un agent au sein de votre App \{#run-an-agent-inside-your-app\}

Le [plugin `agents`](/fr/docs/appkit/v0/plugins/agents) héberge l&#39;agent dans votre App. Vous le définissez en markdown ou en code, vous y connectez des outils, et il est exposé sur des routes intégrées, sans aucun endpoint à provisionner. Pour un nouvel agent personnalisé ou un Supervisor Agent, commencez ici.

Pour un Supervisor qui coordonne des spaces Genie, des fonctions Unity Catalog ou d&#39;autres agents, l&#39;adaptateur Supervisor API exécute l&#39;agent comme un service managé sur Databricks :

```typescript title="server/server.ts"
import { createApp } from "@databricks/appkit";
import {
  agents,
  createAgent,
  DatabricksAdapter,
} from "@databricks/appkit/beta";

await createApp({
  plugins: [
    agents({
      agents: {
        assistant: createAgent({
          instructions: "You are a helpful assistant.",
          model: DatabricksAdapter.fromSupervisorApi({
            model: "databricks-claude-sonnet-4-6",
          }),
        }),
      },
    }),
  ],
});
```

Consultez la [référence du plugin `agents`](/fr/docs/appkit/v0/plugins/agents) pour en savoir plus sur les agents markdown, la limitation de portée des outils, les sous-agents et les outils Supervisor hébergés.

## Appeler un endpoint d&#39;agent existant \{#call-an-existing-agent-endpoint\}

Certains agents sont accessibles via un endpoint Model Serving plutôt qu&#39;exécutés dans l&#39;application. C&#39;est toujours le cas d&#39;un Knowledge Assistant, et cela peut l&#39;être d&#39;un Supervisor Agent ou d&#39;un custom Python agent. Le plugin Model Serving les appelle tous par leur nom, comme un foundation model. Voici les builders qui produisent un tel endpoint :

| Builder          | À utiliser quand                                                                       | Configuration                                                                                                                                                                                                                                |
| ------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Knowledge Assistant | Questions-réponses sur vos documents, avec citations                                        | [Knowledge Assistant](https://docs.databricks.com/aws/en/agents/agent-bricks/knowledge-assistant) (interface du workspace)                                                                                                                      |
| Supervisor Agent    | Coordonner des Genie Agents, d&#39;autres agents, des fonctions Unity Catalog ou des serveurs MCP | [Supervisor Agent](https://docs.databricks.com/aws/en/agents/agent-bricks/multi-agent-supervisor) (interface du workspace), ou la [Supervisor API](https://docs.databricks.com/aws/en/agents/agent-bricks/supervisor-api) pour en créer un par le code |
| Custom Python agent | Aucune autre option ne convient : votre propre orchestration, vos outils ou votre framework                 | [Créer un agent](https://docs.databricks.com/aws/en/agents/custom-agents/author-agent) en Python                                                                                                                                     |

Les builders Knowledge Assistant et Supervisor Agent se configurent en quelques clics dans le workspace. Vous pouvez aussi les créer depuis votre agent de code avec la compétence d&#39;agent [`databricks-agent-bricks`](/fr/docs/tools/ai-tools/agent-skills). La [Supervisor API](https://docs.databricks.com/aws/en/agents/agent-bricks/supervisor-api) permet de définir un Supervisor Agent en Python, pour les équipes qui préfèrent le code à l&#39;interface du workspace.

Déployer un custom agent sur son propre endpoint Model Serving avec `agents.deploy()` est une approche héritée. Privilégiez son exécution dans l&#39;application (voir ci-dessus), ou consultez [Créer un agent](https://docs.databricks.com/aws/en/agents/custom-agents/author-agent) et [Migrer vers Databricks Apps](https://docs.databricks.com/aws/en/agents/custom-agents/migrate-agent-to-apps).

## Mise en place \{#wire-it-up\}

Le plugin Model Serving appelle les endpoints d&#39;agent exactement comme il appelle les endpoints de foundation model. Faites pointer le plugin vers la variable d&#39;environnement de votre agent :

```typescript title="server/server.ts"
serving({
  endpoints: {
    assistant: { env: "DATABRICKS_AGENT_ENDPOINT" },
  },
}),
```

Liez la variable d&#39;environnement à une ressource `serving-endpoint` dans `app.yaml` :

```yaml title="app.yaml"
env:
  - name: DATABRICKS_AGENT_ENDPOINT
    valueFrom: serving-endpoint
```

Lorsque vous ajoutez l&#39;endpoint de l&#39;agent comme ressource d&#39;application (interface Databricks Apps ou CLI), Databricks accorde le droit `CAN QUERY` sur cet endpoint au service principal de votre application.

Pour la mise en œuvre complète, y compris `createApp`, `useServingStream` et les gestionnaires de routes personnalisés, consultez [Appeler un endpoint gouverné depuis AppKit](/fr/docs/agents/ai-gateway#call-a-governed-endpoint-from-appkit).

## À quoi ressemble la réponse \{#what-the-response-looks-like\}

Les réponses en streaming arrivent sous forme de fragments `useServingStream`. Les appels sans streaming renvoient l&#39;objet complet via `useServingInvoke`. Le format de la requête est généralement compatible avec OpenAI Chat Completions (`messages`, `max_tokens`, `stream` en option). Les endpoints reposant sur `ResponsesAgent` utilisent plutôt l&#39;API OpenAI Responses (`input` à la place de `messages`).

Le format de la réponse dépend du builder : vérifiez-le plutôt que de le deviner.

1. Ouvrez votre endpoint d&#39;agent dans le workspace et cliquez sur **Open in Playground**.
2. Cliquez sur **Get code** et choisissez **Curl API** ou **Python API**.
3. Exécutez l&#39;exemple et inspectez la réponse pour connaître les champs exacts.

## Permissions par utilisateur \{#per-user-permissions\}

Par défaut, les routes de serving d&#39;AppKit s&#39;exécutent pour le compte de l&#39;utilisateur authentifié. Si l&#39;agent accède à des données propres à l&#39;utilisateur (par exemple un Supervisor Agent qui redirige vers un Genie Agent que l&#39;utilisateur est autorisé à interroger), celui-ci ne voit que les données auxquelles il a droit. Aucun code d&#39;authentification supplémentaire n&#39;est nécessaire.

Pour la logique serveur en dehors des routes de plugin intégrées (par exemple des routes Express personnalisées), appelez `AppKit.serving("assistant").asUser(req).invoke(...)` afin de conserver ce comportement par utilisateur. Pour les traitements en arrière-plan sans requête (tâches planifiées, workers), omettez `asUser` : l&#39;appel s&#39;exécute alors avec le service principal de l&#39;application.

## Et ensuite ? \{#where-to-next\}

Essayez l&#39;[AI Chat App](/fr/templates/ai-chat-app) pour une configuration complète d&#39;AppKit et d&#39;agent, ou parcourez le [catalogue de modèles](/fr/templates) pour découvrir d&#39;autres approches.