---
title: Configuration de l'application
sidebar_label: Configuration
sourceOfTruth:
  skills:
    - databricks-apps
  docs:
    - /docs/appkit/v0/configuration
    - https://docs.databricks.com/aws/en/dev-tools/databricks-apps/
---

# Configuration de l'application \{#app-configuration\}

Deux fichiers déterminent la façon dont votre application AppKit démarre et ce à quoi elle se connecte : `app.yaml` (comportement d'exécution et variables d'environnement) et `databricks.yml` (ressources Databricks). Chaque application se voit attribuer une URL fixe à sa création. Celle-ci ne peut pas être modifiée.

:::tip[Vous développez en Python ?]

AppKit cible TypeScript sur Node.js. Le développement d'applications Python n'est pas traité sur ce site. Consultez la [documentation Databricks Apps](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/) pour les frameworks Python (Gradio, Streamlit, Dash).

:::

## Fichiers de configuration \{#configuration-files\}

**`app.yaml`** définit le comportement à l&#39;exécution (commande de démarrage et variables d&#39;environnement) :

```yaml
command: ["npm", "run", "start"]
env:
  - name: LAKEBASE_ENDPOINT
    valueFrom: postgres
  - name: WAREHOUSE_ID
    valueFrom: sql-warehouse
```

La valeur de `command` est une séquence (tableau), et non une chaîne shell. L&#39;expansion des variables d&#39;environnement n&#39;est pas prise en charge dans `command`, à l&#39;exception de `DATABRICKS_APP_PORT`.

**`databricks.yml`** déclare les ressources Databricks, les variables et les cibles de déploiement :

```yaml
resources:
  apps:
    my-app:
      resources:
        - name: postgres
          postgres:
            branch: ${var.postgres_branch}
            database: ${var.postgres_database}
            permission: CAN_CONNECT_AND_CREATE
```

Les variables telles que `${var.postgres_branch}` sont résolues à partir de la section `variables` du fichier `databricks.yml` ou à partir des options de la CLI au moment du déploiement.

Pour la référence complète du fichier `app.yaml` propre à AppKit, y compris les liaisons de ressources des plugins, consultez [Configuration d&#39;AppKit](/docs/appkit/v0/configuration).


## Manifeste des plugins \{#plugin-manifest\}

Chaque application AppKit possède un fichier `appkit.plugins.json` qui déclare les plugins actifs ainsi que les ressources Databricks dont ils ont besoin. Ce fichier est généré automatiquement par la commande suivante :

```bash
npx @databricks/appkit plugin sync --write
```

Cette opération s&#39;exécute automatiquement lors de `npm run dev` et `npm run build`. Commitez le fichier avec votre code : la CLI et le pipeline de déploiement s&#39;en servent pour provisionner les ressources.


## Ressources \{#resources\}

Les apps accèdent aux services Databricks via des ressources déclarées. Chaque ressource possède un `name` dans `databricks.yml`. Utilisez ce nom comme valeur de `valueFrom` dans `app.yaml`.

Les templates AppKit utilisent des noms conventionnels pour les ressources gérées par les plugins :

| Ressource                                                                     | Nom de la ressource | Ce qu'elle fournit                        |
| ----------------------------------------------------------------------------- | ------------------ | ----------------------------- |
| [Lakebase Postgres](/docs/lakebase/quickstart)                                | `postgres`         | Connexion PostgreSQL          |
| [SQL Warehouse](https://docs.databricks.com/aws/en/compute/sql-warehouse/)    | `sql-warehouse`    | Exécution de requêtes SQL     |
| [Model Serving](/docs/agents/ai-gateway)                                      | `serving-endpoint` | Inférence de modèles d'IA     |
| [Genie Agent](/docs/agents/genie)                                             | `genie-space`      | Requêtes de données en langage naturel |
| [Job](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/resources) | `job`              | Job planifié ou déclenché     |
| [UC Volumes](https://docs.databricks.com/aws/en/files/)                       | `volume`           | Stockage de fichiers          |

D'autres types de ressources (tables Unity Catalog, connexions, index AI Search (anciennement Vector Search), expériences MLflow, etc.) sont répertoriés dans la [documentation officielle sur les ressources](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/resources).

### Secrets \{#secrets\}

Aucun des deux fichiers de configuration ne contient la valeur du secret. `databricks.yml` déclare une ressource pointant vers un [scope de secrets](https://docs.databricks.com/aws/en/security/secrets) et une clé que vous définissez, tandis qu'`app.yaml` référence cette ressource par son nom. La plateforme injecte la valeur déchiffrée à l'exécution.

1. Stockez la valeur du secret avec la Databricks CLI :

   ```bash
   databricks secrets create-scope my-app-secrets
   databricks secrets put-secret my-app-secrets MY_SECRET --string-value "..."
   ```

2. Déclarez la ressource de type secret dans `databricks.yml` :

   ```yaml
   resources:
     apps:
       my-app:
         resources:
           - name: my-secret # libellé de cette ressource (défini par l'utilisateur)
             secret:
               scope: my-app-secrets # nom du scope de secrets Databricks
               key: MY_SECRET # clé au sein de ce scope
               permission: READ
   ```

3. Associez-la à une variable d'environnement dans `app.yaml` :

   ```yaml
   env:
     - name: MY_SECRET
       valueFrom: my-secret # référence le nom de la ressource ci-dessus, et non la valeur du secret
   ```

À l'exécution, `MY_SECRET` contient la valeur déchiffrée du secret. Aucun des deux fichiers ne contient la valeur elle-même.

## Variables d'environnement \{#environment-variables\}

La plateforme injecte automatiquement ces variables au moment de l'exécution :

| Variable                   | Description                            |
| -------------------------- | -------------------------------------- |
| `DATABRICKS_HOST`          | URL du workspace                       |
| `DATABRICKS_APP_PORT`      | Port sur lequel votre app doit écouter |
| `DATABRICKS_APP_NAME`      | Nom de l'app                           |
| `DATABRICKS_CLIENT_ID`     | ID client du service principal         |
| `DATABRICKS_CLIENT_SECRET` | Secret client du service principal     |
| `DATABRICKS_WORKSPACE_ID`  | ID du workspace                        |

Les variables personnalisées se déclarent dans `app.yaml`, sous `env`. Utilisez `value` pour du texte brut et `valueFrom` pour les [noms de ressources](#resources). Ne placez jamais de secrets dans `value`.

## Modèle d'authentification \{#auth-model\}

Chaque application dispose d'un service principal dédié. Databricks injecte automatiquement `DATABRICKS_CLIENT_ID` et `DATABRICKS_CLIENT_SECRET` à l'exécution, et supprime le service principal en même temps que l'application.

L'**autorisation utilisateur** (Public Preview) transmet le jeton de l'utilisateur connecté via l'en-tête HTTP `x-forwarded-access-token`. Les portées (par exemple `sql`, `genie`, `files`) se configurent dans l'interface du workspace. Les plugins [Genie](/docs/agents/genie) et [Model Serving](/docs/agents/ai-gateway) intégrés à AppKit l'utilisent automatiquement. Consultez le [contexte d'exécution](/docs/appkit/v0/plugins/execution-context) pour l'implémentation AppKit, ou [app authorization](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/auth) pour le détail complet côté plateforme.

## Compute \{#compute\}

Les tailles de compute disponibles sont `MEDIUM` (valeur par défaut), `LARGE` et `XLARGE` (la disponibilité varie selon le workspace). Définissez la taille dans l'interface du workspace ou via l'option `--compute-size` des commandes `databricks apps create` et `databricks apps update`. Consultez la [documentation Databricks Apps](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/) pour connaître le nombre de vCPU, la RAM et les DBU associés à chaque taille.

## Contraintes \{#constraints\}

- Pas de système de fichiers persistant (utilisez [Lakebase Postgres](/docs/lakebase/quickstart), DBSQL ou les UC Volumes pour la persistance)
- Les fichiers de plus de 10 Mo font échouer le déploiement
- SIGTERM laisse 15 secondes avant SIGKILL
- Runtime : Ubuntu 22.04, Node 22, Python 3.11

Consultez les [Bonnes pratiques](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/best-practices) pour des recommandations sur la gestion de l'arrêt, la gestion des secrets et le réseau.

## Statuts d'application \{#app-statuses\}

| Statut    | Signification                                        |
| --------- | ---------------------------------------------------- |
| Running   | L'application fonctionne et traite le trafic         |
| Deploying | Un nouveau déploiement est en cours                  |
| Crashed   | L'application n'a pas pu démarrer ou s'est arrêtée   |
| Stopped   | L'application a été arrêtée manuellement             |

## Pour aller plus loin \{#where-to-next\}

Consultez [Développement d'applications](/docs/apps/development) pour la configuration locale, les options de déploiement et l'API complète des plugins, ou parcourez le [catalogue de templates](/templates) pour découvrir des modèles d'implémentation complets.