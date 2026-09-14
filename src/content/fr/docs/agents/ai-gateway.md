---
title: Unity AI Gateway
sidebar_label: Unity AI Gateway
description: Appelez des endpoints LLM gouvernés depuis votre application AppKit à l'aide du plugin Model Serving. Unity AI Gateway ajoute des limites de débit, le suivi de l'utilisation, des garde-fous et l'attribution des coûts.
sourceOfTruth:
  skills:
    - databricks-model-serving
  docs:
    - /docs/appkit/v0/plugins/model-serving
    - https://docs.databricks.com/aws/en/ai-gateway/ai-governance
  note: "databricks-model-serving couvre le chemin d'appel vers l'endpoint de serving ainsi que les limites de débit d'AI Gateway. La gouvernance complète d'AI Gateway, les services de modèles et la gouvernance MCP ne sont couverts que par la documentation (pas encore de skill)."
---

# Unity AI Gateway \{#unity-ai-gateway\}

**Unity AI Gateway** est la couche de gouvernance Databricks pour les endpoints LLM et les serveurs MCP. Elle impose des limites de débit, applique des garde-fous et assure le suivi de l'utilisation et des coûts. Consultez la [présentation d'Unity AI Gateway](https://docs.databricks.com/aws/en/ai-gateway/) pour une introduction complète au produit. Depuis votre application AppKit, vous appelez un endpoint gouverné à l'aide du plugin Model Serving. Cette page décrit l'intégration dans AppKit ainsi que la CLI permettant d'inspecter et de provisionner les endpoints.

## Prérequis \{#prerequisites\}

- Databricks CLI `v1.0.0+` avec un [profil authentifié](/docs/tools/databricks-cli#authenticate).
- Une application AppKit en cours d'exécution. Voir [Démarrage rapide avec les Apps](/docs/apps/quickstart).
- Un endpoint de serving que votre application peut interroger. La plupart des workspaces disposent de foundation models hébergés par Databricks (préfixés `databricks-`, par exemple `databricks-claude-sonnet-4-6`) déjà configurés avec AI Gateway. Les identifiants de modèles changent au fil du temps : consultez la liste des [modèles pris en charge](https://docs.databricks.com/aws/en/machine-learning/foundation-model-apis/supported-models) pour connaître les noms actuels, ou exécutez [Lister les endpoints disponibles](#list-available-endpoints) pour voir ceux que votre workspace expose.

## Appeler un endpoint gouverné depuis AppKit \{#call-a-governed-endpoint-from-appkit\}

Le [plugin Model Serving](/docs/appkit/v0/plugins/model-serving) prend en charge la plomberie HTTP, l'authentification et le streaming. Les noms des endpoints sont fournis par des variables d'environnement au runtime : le même code s'exécute donc en local comme en production.

### Enregistrer le plugin \{#register-the-plugin\}

```typescript title="server/server.ts"
import { createApp, server, serving } from "@databricks/appkit";

const AppKit = await createApp({
  plugins: [
    server(),
    serving({
      endpoints: {
        chat: { env: "DATABRICKS_SERVING_ENDPOINT_NAME" },
      },
    }),
  ],
});
```

`chat` est un alias que vous choisissez. Le plugin le résout au moment de la requête en lisant `DATABRICKS_SERVING_ENDPOINT_NAME`. Définissez cette variable d&#39;environnement dans `app.yaml` :

```yaml title="app.yaml"
env:
  - name: DATABRICKS_SERVING_ENDPOINT_NAME
    valueFrom: serving-endpoint
```

Lors du déploiement, Databricks Apps injecte le nom de l&#39;endpoint dans le conteneur. En développement local, définissez la variable d&#39;environnement dans `.env`.


### Diffuser un flux depuis un composant React \{#stream-from-a-react-component\}

```tsx title="client/src/ChatPanel.tsx"
import { useState } from "react";
import { useServingStream } from "@databricks/appkit-ui/react";

export function ChatPanel() {
  const [prompt, setPrompt] = useState("");
  const { stream, chunks, streaming, error, reset } = useServingStream(
    { messages: [{ role: "user", content: prompt }], max_tokens: 500 },
    { alias: "chat" },
  );

  return (
    <>
      <input value={prompt} onChange={(e) => setPrompt(e.target.value)} />
      <button onClick={() => stream()} disabled={streaming || !prompt}>
        Send
      </button>
      <button onClick={reset}>Clear</button>
      {chunks.map((chunk, i) => (
        <pre key={i}>{JSON.stringify(chunk)}</pre>
      ))}
      {error && <p>{error}</p>}
    </>
  );
}
```

Le premier argument correspond au corps de la requête. Le second contient les options, dont l&#39;alias. Le hook gère la connexion SSE, l&#39;interrompt au démontage et accumule les chunks analysés dans l&#39;état. Pour un appel sans streaming, utilisez `useServingInvoke` avec la même structure.

Pour les modèles de chat, extrayez le texte de chaque chunk (généralement `chunk.choices?.[0]?.delta?.content`) et concaténez-le pour l&#39;affichage. Pendant le développement, afficher les chunks bruts au format JSON permet d&#39;en confirmer la structure avant d&#39;écrire votre logique d&#39;affichage.


### L&#39;appeler depuis un gestionnaire de route \{#call-it-from-a-route-handler\}

Pour l&#39;orchestration d&#39;agents, le pré/post-traitement ou la journalisation côté backend, appelez directement le plugin. Par défaut, les routes HTTP intégrées du plugin s&#39;exécutent avec l&#39;identité de l&#39;utilisateur authentifié. Dans un gestionnaire de route personnalisé comme celui-ci, appelez explicitement `.asUser(req)` pour obtenir le même comportement par utilisateur.

```typescript title="server/server.ts"
AppKit.server.extend((app) => {
  app.post("/api/summarize", async (req, res) => {
    const { text } = req.body;
    const result = await AppKit.serving("chat")
      .asUser(req)
      .invoke({
        messages: [
          { role: "system", content: "Summarize the text in two sentences." },
          { role: "user", content: text },
        ],
      });
    res.json(result);
  });
});
```


### Mode nommé ou mode par défaut \{#named-versus-default-mode\}

Les exemples ci-dessus utilisent le **mode nommé** avec un alias explicite. Omettez la configuration pour enregistrer un alias `default` adossé à `DATABRICKS_SERVING_ENDPOINT_NAME`. Le mode nommé permet de gérer plusieurs endpoints (chat, classificateur, embeddings) au sein d'une même application.

## Gouvernance et Unity AI Gateway \{#governance-and-unity-ai-gateway\}

La gouvernance s'applique côté Databricks, et non dans AppKit. Votre application appelle l'endpoint, et la passerelle applique la politique. Unity AI Gateway constitue le plan de contrôle du trafic IA : elle achemine les requêtes vers les modèles et les serveurs MCP, et applique les limites de débit, les contrôles de coûts, les politiques de service et le suivi de l'utilisation. Unity Catalog gouverne les modèles, les serveurs MCP et les fonctions sous-jacents. Pour connaître les fonctionnalités et la configuration actuelles, y compris les fonctionnalités en bêta que vous activez depuis la page Previews de la console de compte, consultez [AI governance with Unity AI Gateway](https://docs.databricks.com/aws/en/ai-gateway/ai-governance).

Dans AppKit, le plugin Model Serving appelle les endpoints de serving par leur nom. Cela inclut les foundation models (préfixe `databricks-`), les Knowledge Assistants, les Supervisor Agents et les agents Python personnalisés. Le plugin n'appelle pas les services de modèles Unity AI Gateway, qui sont des objets Unity Catalog interrogés par nom complet via l'API compatible OpenAI de la passerelle. Pour en utiliser un, consultez [Query model services](https://docs.databricks.com/aws/en/ai-gateway/query-model-services).

Pour plus de détails sur chacun d'eux, consultez :

- Services de modèles : [overview](https://docs.databricks.com/aws/en/ai-gateway/model-services) et [governance](https://docs.databricks.com/aws/en/ai-gateway/govern-model-services).
- Services de fournisseurs de modèles : [overview](https://docs.databricks.com/aws/en/ai-gateway/model-provider-services) et [governance](https://docs.databricks.com/aws/en/ai-gateway/govern-model-provider-services).
- Gouvernance des serveurs MCP : [register an MCP service](https://docs.databricks.com/aws/en/ai-gateway/register-mcp-service) et [govern it](https://docs.databricks.com/aws/en/ai-gateway/govern-mcp-service). Ce cas se présente lorsqu'un endpoint d'agent que vous appelez, par exemple un Supervisor Agent ou un agent Python personnalisé, s'adresse en interne à un serveur MCP. Les applications AppKit ne le configurent pas directement.
- Version précédente : [AI Gateway on serving endpoints](https://docs.databricks.com/aws/en/ai-gateway/overview-serving-endpoints), où vous activez les fonctionnalités endpoint par endpoint et où les journaux d'utilisation sont écrits dans `system.serving.endpoint_usage`.

## Lister les endpoints disponibles \{#list-available-endpoints\}

Utilisez la CLI pour voir quels endpoints votre workspace expose et lesquels disposent déjà de fonctionnalités AI Gateway configurées. Chaque commande ci-dessous présente une invocation courante ainsi que l&#39;ensemble complet de ses options. Exécutez `databricks serving-endpoints <command> --help` pour connaître le comportement actuel des options, la CLI faisant foi.

```bash title="Common"
databricks serving-endpoints list -o json
```

```bash title="All Options"
databricks serving-endpoints list \
  --limit $LIMIT \
  --debug \
  -o json \
  --target $TARGET \
  --profile $DATABRICKS_PROFILE
```

Les endpoints de l&#39;API Foundation Model (préfixés par `databricks-`) sont disponibles dans la plupart des workspaces, avec AI Gateway intégré. Par exemple, `databricks-claude-sonnet-4-6`. La disponibilité varie d&#39;un workspace à l&#39;autre.

<details>
<summary>Exemple de sortie (tronqué)</summary>

```json
[
  {
    "ai_gateway": {
      "usage_tracking_config": { "enabled": true }
    },
    "config": {
      "served_entities": [
        {
          "foundation_model": {
            "display_name": "Claude Sonnet 4.6",
            "name": "system.ai.databricks-claude-sonnet-4-6"
          },
          "name": "databricks-claude-sonnet-4-6"
        }
      ]
    },
    "name": "databricks-claude-sonnet-4-6",
    "state": { "config_update": "NOT_UPDATING", "ready": "READY" },
    "task": "llm/v1/chat"
  }
]
```

</details>

<!-- cli-options:serving-endpoints list -->

| Option            | Description                                     |
| ----------------- | ----------------------------------------------- |
| `--limit`         | Nombre maximal de résultats à renvoyer.         |
| `--debug`         | activer la journalisation de débogage           |
| `--output`, `-o`  | type de sortie : text ou json (text par défaut) |
| `--profile`, `-p` | profil ~/.databrickscfg                         |
| `--target`, `-t`  | bundle target à utiliser (le cas échéant)       |

<!-- /cli-options -->


## Inspecter un endpoint \{#inspect-an-endpoint\}

```bash
databricks serving-endpoints get databricks-claude-sonnet-4-6 -o json
```

Recherchez `ai_gateway` dans la réponse pour confirmer qu&#39;AI Gateway est bien configuré sur l&#39;endpoint. `get` n&#39;accepte aucune option propre à la commande en plus des options globales ; exécutez `databricks serving-endpoints get --help` si vous en avez besoin.


## Interroger depuis le terminal \{#query-from-the-terminal\}

Pratique pour effectuer un test rapide d&#39;un endpoint avant de l&#39;intégrer à votre application.

```bash title="Common"
databricks serving-endpoints query databricks-claude-sonnet-4-6 \
  --json '{"messages": [{"role": "user", "content": "Hello"}], "max_tokens": 100}'
```

```bash title="All Options"
databricks serving-endpoints query $ENDPOINT_NAME \
  --json '{"messages": [{"role": "user", "content": "Hello"}]}' \
  --max-tokens 100 \
  --n 1 \
  --temperature 0.7 \
  --stream \
  --client-request-id $REQUEST_ID \
  --debug \
  -o json \
  --target $TARGET \
  --profile $DATABRICKS_PROFILE
```

<!-- cli-options:serving-endpoints query -->

| Option                | Description                                                                                                                                               |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--client-request-id` | Identifiant de requête facultatif fourni par l&#39;utilisateur, qui sera enregistré dans la table d&#39;inférence et la table de suivi d&#39;utilisation. |
| `--json`              | soit une chaîne JSON en ligne, soit @chemin/vers/fichier.json contenant le corps de la requête (JSON par défaut (0 octet))                                |
| `--max-tokens`        | Champ max tokens utilisé UNIQUEMENT pour les endpoints de serving **completions** et **chat external &amp; foundation model**.                            |
| `--n`                 | Champ n (nombre de candidats) utilisé UNIQUEMENT pour les endpoints de serving **completions** et **chat external &amp; foundation model**.               |
| `--stream`            | Champ stream utilisé UNIQUEMENT pour les endpoints de serving **completions** et **chat external &amp; foundation model**.                                |
| `--temperature`       | Champ temperature utilisé UNIQUEMENT pour les endpoints de serving **completions** et **chat external &amp; foundation model**.                           |
| `--debug`             | activer la journalisation de débogage                                                                                                                     |
| `--output`, `-o`      | type de sortie : text ou json (text par défaut)                                                                                                           |
| `--profile`, `-p`     | profil ~/.databrickscfg                                                                                                                                   |
| `--target`, `-t`      | bundle target à utiliser (le cas échéant)                                                                                                                 |

<!-- /cli-options -->


## Provisionner un endpoint \{#provision-an-endpoint\}

```bash title="Common"
databricks serving-endpoints create my-model-endpoint \
  --json '{
    "config": {
      "served_entities": [
        {
          "name": "my-entity",
          "entity_name": "my-registered-model",
          "workload_size": "Small",
          "scale_to_zero_enabled": true
        }
      ]
    }
  }'
```

```bash title="All Options"
databricks serving-endpoints create $ENDPOINT_NAME \
  --json @config.json \
  --budget-policy-id $BUDGET_POLICY_ID \
  --description "My model endpoint" \
  --route-optimized \
  --no-wait \
  --timeout 20m \
  --debug \
  -o json \
  --target $TARGET \
  --profile $DATABRICKS_PROFILE
```

Attendez que l&#39;endpoint passe à l&#39;état `READY` avant de l&#39;interroger. Pour une procédure pas à pas, consultez le modèle [Create a Model Serving Endpoint](/templates/model-serving-endpoint-creation).

<!-- cli-options:serving-endpoints create -->

| Option               | Description                                                                                                    |
| -------------------- | -------------------------------------------------------------------------------------------------------------- |
| `--budget-policy-id` | Politique budgétaire à appliquer à l&#39;endpoint de serving.                                                  |
| `--description`      |                                                                                                                |
| `--json`             | chaîne JSON en ligne ou @chemin/vers/fichier.json contenant le corps de la requête (par défaut JSON (0 bytes)) |
| `--no-wait`          | ne pas attendre l&#39;état NOT&#95;UPDATING                                                                    |
| `--route-optimized`  | Activer l&#39;optimisation du routage pour l&#39;endpoint de serving.                                          |
| `--timeout`          | durée maximale d&#39;attente de l&#39;état NOT&#95;UPDATING (par défaut 20m0s)                                 |
| `--debug`            | activer la journalisation de débogage                                                                          |
| `--output`, `-o`     | type de sortie : text ou json (par défaut text)                                                                |
| `--profile`, `-p`    | profil ~/.databrickscfg                                                                                        |
| `--target`, `-t`     | bundle target à utiliser (le cas échéant)                                                                      |

<!-- /cli-options -->


## Intégrations avec les agents de codage \{#coding-agent-integrations\}

Unity AI Gateway peut également régir les outils de codage IA tels que Cursor, Codex CLI et Gemini CLI, afin que leurs requêtes partagent une même facture, un même tableau de bord d'utilisation et les mêmes limites de débit. Databricks recommande [`ucode`](https://github.com/databricks/ucode) pour effectuer cette configuration. Consultez [Integrate with coding agents](https://docs.databricks.com/aws/en/ai-gateway/coding-agent-integration-model-services) pour connaître les étapes de configuration et la liste actuelle des outils pris en charge.

## Et ensuite ? \{#where-to-next\}

Essayez l'[application AI Chat](/templates/ai-chat-app) pour intégrer un endpoint gouverné à votre application, ou découvrez les autres fonctionnalités liées aux agents : [Genie Agents](/docs/agents/genie) ou [Endpoints d'agents personnalisés](/docs/agents/custom-agents).