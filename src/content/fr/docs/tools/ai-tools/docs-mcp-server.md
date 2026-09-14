---
title: Docs MCP Server
---

# Docs MCP Server \{#docs-mcp-server\}

Le Docs MCP Server de DevHub offre aux agents de codage et aux assistants d'IDE un accès en lecture à l'ensemble des pages de documentation de DevHub. Les agents peuvent ainsi explorer les pages disponibles et récupérer chaque document au format markdown sans quitter l'éditeur.

## Installation \{#install\}

Ajoutez le serveur à n&#39;importe quel agent de codage pris en charge (Cursor, Claude Code, VS Code, Codex, etc.) en une seule commande.

Installation globale (au niveau de l&#39;utilisateur, disponible dans tous les projets) :

```bash
npx add-mcp __DEVHUB_SITE_URL__/api/mcp --name devhub-docs -g
```

Installation au niveau du projet (répertoire courant uniquement) :

```bash
npx add-mcp __DEVHUB_SITE_URL__/api/mcp --name devhub-docs
```

Pour cibler un agent spécifique, ajoutez `-a` :

```bash
npx add-mcp __DEVHUB_SITE_URL__/api/mcp --name devhub-docs -g -a cursor
```

Redémarrez votre éditeur après avoir ajouté le serveur. Certains éditeurs, comme Cursor, nécessitent d&#39;ouvrir la page des paramètres MCP pour y activer le nouveau serveur.


## Vérifier la connexion \{#verify-the-connection\}

Après l'installation, assurez-vous que le serveur fonctionne :

1. Vérifiez que `devhub-docs` apparaît dans la liste de vos outils.
   - Exemple : « As-tu le MCP devhub-docs installé ? »
2. Demandez à votre agent d'appeler `list_docs_resources` et vérifiez qu'il renvoie bien un index de la documentation.
   - Exemple : « Quelles sont les documentations disponibles sur devhub ? »
3. Demandez à votre agent de récupérer une page précise avec `get_doc_resource`.
   - Exemple : « Quel est le contenu de la page start-here ? »

En pratique, vous n'avez pas à vous soucier d'appeler les outils vous-même : demandez simplement à votre agent de faire le travail, il les appellera en interne.

## Référence des outils \{#tools-reference\}

Le serveur expose deux outils en lecture seule.

### `list_docs_resources` \{#list_docs_resources\}

Liste toutes les pages de documentation développeur Databricks disponibles. Renvoie l&#39;index de la documentation au format markdown, avec les URL et les titres des pages.

Aucun paramètre.

```
list_docs_resources()
→ index markdown de toutes les pages de documentation, avec leurs slugs et leurs titres
```


### `get_doc_resource` \{#get_doc_resource\}

Récupère une page de la documentation développeur Databricks au format markdown. Utilisez d&#39;abord `list_docs_resources` pour découvrir les slugs disponibles.

| Paramètre | Type   | Requis | Description                                                                                                                    |
| --------- | ------ | ------ | ------------------------------------------------------------------------------------------------------------------------------ |
| `slug`    | string | oui    | Le slug (chemin) de la page de documentation, par exemple `start-here`. Utilisez `list_docs_resources` pour trouver les slugs. |

```
get_doc_resource(slug: "start-here")
→ full markdown content of the requested page
```

Les pages qui déclarent une source de vérité commencent par une brève ligne **Source de vérité** indiquant la ou les compétences d&#39;agent ainsi que la documentation canonique à charger pour connaître le comportement actuel du produit.


## Et maintenant ? \{#where-to-next\}

Avec la [Databricks CLI](/docs/tools/databricks-cli), les [compétences d'agent](/docs/tools/ai-tools/agent-skills) et le Docs MCP Server installés, votre agent de codage dispose de tout ce qu'il faut pour développer et déployer.

Prêt à vous lancer ? Découvrez comment les [modèles](/docs/templates) vous aident à générer rapidement la structure de votre projet, ou parcourez directement le [catalogue de modèles](/templates).