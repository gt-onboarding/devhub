---
title: Genie Agents
sidebar_label: Genie
description: Intégrez une interface de chat sur vos tables Unity Catalog grâce au plugin Genie d'AppKit et au composant GenieChat. Aucun code text-to-SQL, aucun prompt, aucun LLM personnalisé.
sourceOfTruth:
  skills:
    - databricks-genie-agents
  docs:
    - /docs/appkit/v0/plugins/genie
    - https://docs.databricks.com/aws/en/genie-agents/
---

# Genie Agents \{#genie-agents\}

Offrez à vos utilisateurs une zone de chat qui interroge vos données. Aucun text-to-SQL, aucun mappage de schéma, aucun LLM personnalisé à développer. Un **Genie Agent** (anciennement Genie space) est une interface Databricks en langage naturel par-dessus vos tables Unity Catalog : des jeux de données organisés, une base de connaissances (synonymes, exemples de requêtes SQL, descriptions de colonnes) et un système d'IA composite qui convertit les questions en SQL. Votre application AppKit s'y connecte avec un plugin côté serveur et un composant sur la page.

Pour essayer un Genie Agent dans le workspace avant de l'intégrer, consultez [Utiliser un Genie Agent](https://docs.databricks.com/aws/en/genie-agents/talk-to-genie). Pour en créer ou en gérer un depuis votre agent de codage, utilisez l'agent skill [`databricks-genie-agents`](/docs/tools/ai-tools/agent-skills).

:::note[Les Genie Agents au sein de la famille Genie]

Genie est une famille de produits Databricks : Genie One, Genie Agents et Genie Code. Cette page traite des Genie Agents, l'interface en langage naturel par-dessus vos tables Unity Catalog, et de la façon d'en intégrer un dans une application AppKit. Pour les autres produits, consultez la [présentation de Genie](https://docs.databricks.com/aws/en/genie/).

:::

## Prérequis \{#prerequisites\}

- Databricks CLI `v1.0.0+` avec un [profil authentifié](/docs/tools/databricks-cli#authenticate).
- Une application AppKit en cours d'exécution. Consultez [Démarrage rapide des Apps](/docs/apps/quickstart).
- Un Genie Agent configuré sur des tables Unity Catalog. Consultez [Créer et gérer un Genie Agent](https://docs.databricks.com/aws/en/genie-agents/set-up) pour la procédure de configuration.

  Attachez l'agent en tant que ressource dans la configuration de l'application (interface ou CLI) en sélectionnant **Can run** : Databricks accorde alors cette permission au service principal de votre application. `app.yaml` associe ensuite la ressource à une variable d'environnement. Les permissions des utilisateurs finaux sont abordées [ci-dessous](#permissions-and-data-access).

## Pourquoi Genie \{#why-genie\}

De la question au résultat, Genie :

- **Comprend votre schéma** grâce aux tables Unity Catalog, aux synonymes, aux exemples SQL et aux descriptions de colonnes.
- **Génère du SQL** à partir de questions en langage naturel, en demandant des précisions lorsque la question est ambiguë.
- **Exécute la requête** sur votre entrepôt et renvoie des résultats tabulaires prêts à être affichés.

Le [plugin `genie`](/docs/appkit/v0/plugins/genie) relie tout cela à votre interface de chat, en prenant en charge le streaming SSE, l'authentification et la relecture des conversations.

## Brancher le plugin \{#wire-the-plugin\}

Enregistrez le plugin avec un ou plusieurs alias de space. Les clés d&#39;alias deviennent la propriété `alias` du composant frontend.

```typescript title="server/server.ts"
import { createApp, genie, server } from "@databricks/appkit";

await createApp({
  plugins: [
    server(),
    genie({
      spaces: {
        sales: process.env.SALES_GENIE_SPACE_ID!,
      },
    }),
  ],
});
```

Associez chaque alias à une ressource Genie Agent dans `app.yaml` :

```yaml title="app.yaml"
env:
  - name: SALES_GENIE_SPACE_ID
    valueFrom: genie-space
```

Le runtime Databricks Apps injecte l&#39;ID du space issu de la ressource dans la variable d&#39;environnement. Vous trouverez l&#39;ID de votre space dans l&#39;onglet **Settings** de la page du Genie Agent de votre workspace.

Pour une application à agent unique, omettez entièrement la configuration `spaces` et liez la variable d&#39;environnement par défaut du plugin :

```yaml title="app.yaml"
env:
  - name: DATABRICKS_GENIE_SPACE_ID
    valueFrom: genie-space
```

Si aucun `spaces` n&#39;est fourni, le plugin lit `DATABRICKS_GENIE_SPACE_ID` et l&#39;enregistre sous l&#39;alias `default`.


## Afficher le composant de chat \{#render-the-chat-component\}

```tsx title="client/src/pages/ChatPage.tsx"
import { GenieChat } from "@databricks/appkit-ui/react";

export function ChatPage() {
  return (
    <div style={{ height: 600 }}>
      <GenieChat alias="sales" />
    </div>
  );
}
```

La propriété `alias` doit correspondre à une clé de la configuration `spaces` du serveur. `<GenieChat>` occupe tout l&#39;espace de son parent : placez-le dans un conteneur à hauteur fixe, faute de quoi sa hauteur sera nulle. Le composant affiche les messages, gère le streaming, conserve l&#39;identifiant de la conversation dans l&#39;URL et restitue l&#39;historique au rechargement. Consultez la [référence GenieChat](/docs/appkit/v0/api/appkit-ui/genie/GenieChat) pour la liste complète des propriétés.


## Interface personnalisée avec `useGenieChat` \{#custom-ui-with-usegeniechat\}

Pour une interface de chat personnalisée, utilisez directement le hook. Il renvoie le même flux de messages, ainsi que l&#39;état du cycle de vie de la requête.

```tsx title="client/src/pages/CustomChat.tsx"
import { useGenieChat } from "@databricks/appkit-ui/react";

export function CustomChat() {
  const { messages, status, sendMessage, reset } = useGenieChat({
    alias: "sales",
  });

  return (
    <>
      {messages.map((msg) => (
        <div key={msg.id} data-role={msg.role}>
          {msg.content}
        </div>
      ))}
      <button
        onClick={() => sendMessage("What were total sales last quarter?")}
        disabled={status === "streaming"}
      >
        Ask
      </button>
      <button onClick={reset}>New conversation</button>
    </>
  );
}
```

`status` prend successivement les valeurs `idle`, `streaming`, `loading-history`, `loading-older` et `error`. Utilisez-le pour piloter les états de chargement dans votre interface. Le hook renvoie également `error`, `conversationId` ainsi que des utilitaires de pagination (`hasPreviousPage`, `isFetchingPreviousPage`, `fetchPreviousPage`). Consultez la [référence du plugin Genie d&#39;AppKit](/docs/appkit/v0/plugins/genie) pour le type de retour complet et l&#39;[API de conversation Genie](https://docs.databricks.com/aws/en/genie-agents/conversation-api) pour l&#39;API REST sous-jacente.


## Plusieurs spaces \{#multiple-spaces\}

Enregistrez plusieurs spaces pour permettre à vos utilisateurs de passer d&#39;un domaine à l&#39;autre, par exemple un space commercial et un space de support au sein de la même application.

```typescript title="server/server.ts"
genie({
  spaces: {
    sales: process.env.SALES_GENIE_SPACE_ID!,
    support: process.env.SUPPORT_GENIE_SPACE_ID!,
  },
}),
```

Associez chaque ID à une ressource distincte dans `app.yaml`. Consultez le modèle [Genie Multi-Agent Selector](/templates/genie-multi-space) pour découvrir une interface fonctionnelle offrant le changement d&#39;agent, le nettoyage des conversations et la synchronisation de l&#39;URL.


## Permissions et accès aux données \{#permissions-and-data-access\}

Le plugin `genie` appelle l'API Genie au nom de l'utilisateur connecté. Le service principal de l'application et chaque utilisateur final doivent disposer d'un accès pour qu'une requête aboutisse :

- **Service principal de l'application** : `CAN RUN` sur le Genie Agent, accordé lorsque vous attachez l'agent en tant que ressource de l'application (interface ou CLI) avec l'option **Can run** sélectionnée. Les permissions sur les données sous-jacentes ne sont pas provisionnées automatiquement : accordez séparément au service principal les privilèges `USE CATALOG`, `USE SCHEMA` et `SELECT` sur les tables Unity Catalog. Consultez [Add a Genie Agent resource to an app](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/genie).
- **Utilisateurs finaux** : accès au Genie Agent (partagé avec eux ou via un groupe) et `SELECT` sur les mêmes tables. Si l'utilisateur n'a pas accès, l'appel renvoie une erreur 403. Vous n'avez pas à écrire la vérification des permissions.

## Pour aller plus loin \{#where-to-next\}

Essayez la [Genie Analytics App](/templates/genie-analytics-app) pour un exemple entièrement configuré, ou explorez les [endpoints d'agents personnalisés](/docs/agents/custom-agents) pour les Knowledge Assistants et les Supervisor Agents.