---
title: Démarrage rapide
sourceOfTruth:
  skills:
    - databricks-apps
  docs:
    - /docs/appkit/v0
    - https://docs.databricks.com/aws/en/dev-tools/databricks-apps/
---

# Démarrage rapide \{#quickstart\}

## Prérequis \{#prerequisites\}

- Databricks CLI `v1.0.0+` avec un [profil authentifié](/docs/tools/databricks-cli#authenticate)
- Node.js 22+ (les applications AppKit reposent sur Node/TypeScript)
- Un workspace Databricks avec Apps activé

## Parcours par modèle \{#template-path\}

Les [modèles](/templates) sont des prompts prêts à l&#39;emploi pour les agents, organisés par cas d&#39;usage. Choisissez celui qui correspond à votre besoin, copiez-le dans votre assistant de codage IA : celui-ci se charge du scaffolding, du choix des plugins et du déploiement.

Points de départ courants :

| Modèle                                                                            | Idéal pour                                                                 |
| --------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| [Set Up Your Local Dev Environment](/templates/set-up-your-local-dev-environment) | Installer la CLI, s&#39;authentifier, vérifier le workspace                |
| [Spin Up a Databricks App](/templates/spin-up-databricks-app)                     | Scaffolder une nouvelle app AppKit, l&#39;exécuter en local et la déployer |
| [Onboard Your Coding Agent](/templates/onboard-your-coding-agent)                 | Installer les agent skills, brancher le serveur MCP Docs DevHub            |
| [AI Chat App](/templates/ai-chat-app)                                             | IA conversationnelle, chatbots, assistants                                 |
| [App with Lakebase](/templates/app-with-lakebase)                                 | Applications CRUD avec stockage persistant                                 |

Le [catalogue de modèles](/templates) en donne la liste complète, avec notamment [Lakebase Postgres](/docs/lakebase/quickstart), [Genie Agents](/docs/agents/genie), [Unity AI Gateway](/docs/agents/ai-gateway) et [Agent Bricks](/docs/agents/overview).

Fournissez à votre assistant IA le contexte de la plateforme Databricks en installant les [agent skills](/docs/tools/ai-tools/agent-skills) avant d&#39;y copier le modèle :

```bash
databricks aitools install
```


## Parcours manuel \{#manual-path\}

Sans modèle, `databricks apps init` génère un projet AppKit fonctionnel. Voici ce que produit `--features lakebase` (vous n&#39;avez pas à l&#39;écrire vous-même) :

```typescript
import { createApp, lakebase, server } from "@databricks/appkit";

const AppKit = await createApp({
  plugins: [server(), lakebase()],
});

AppKit.server.extend((app) => {
  app.get("/api/items", async (_req, res) => {
    const { rows } = await AppKit.lakebase.query("SELECT * FROM items");
    res.json(rows);
  });
});
```

Scaffoldez, exécutez en local, puis déployez :

```bash
databricks apps init --name my-app --features lakebase   # génère le projet ci-dessus
cd my-app && npm install && npm run dev                  # exécution en local
databricks apps deploy                                   # déploie dans votre workspace
```

Après le déploiement, la CLI affiche l&#39;URL de votre application dans le workspace.

Pour générer le squelette du projet avec des plugins spécifiques, utilisez `--features` suivi d&#39;une liste de plugins séparés par des virgules. Exécutez `databricks apps manifest` pour afficher tous les plugins disponibles ainsi que les champs de ressources qu&#39;ils requièrent.


## Pour aller plus loin \{#where-to-next\}

Pour le workflow complet de développement local, les indicateurs de déploiement et la configuration des plugins, consultez [Développement d'applications](/docs/apps/development).