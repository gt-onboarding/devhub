---
title: Configuration de Lakebase Postgres
sidebar_label: Configuration
sourceOfTruth:
  skills:
    - databricks-lakebase
  docs:
    - /docs/appkit/v0/plugins/lakebase
    - https://docs.databricks.com/aws/en/oltp/projects/manage-projects
---

# Configuration de Lakebase Postgres \{#lakebase-postgres-configuration\}

AppKit se connecte à Lakebase Postgres via une ressource `postgres` déclarée dans `databricks.yml` et la variable `LAKEBASE_ENDPOINT` définie dans `app.yaml`.

Cette page décrit l'intégration côté AppKit. Pour Lakebase à proprement parler (projets, branches, autoscaling, scale to zero), consultez la [documentation Lakebase](https://docs.databricks.com/aws/en/oltp/) ou l'agent skill [`databricks-lakebase`](/docs/tools/ai-tools/agent-skills).

## Valeurs de connexion \{#connection-values\}

Databricks Apps injecte la plupart des valeurs de connexion au démarrage. `LAKEBASE_ENDPOINT` fait exception : cette variable est déclarée dans `app.yaml` via `valueFrom: postgres` et résolue au démarrage à partir de la ressource `postgres` :

```yaml
env:
  - name: LAKEBASE_ENDPOINT
    valueFrom: postgres
```

| Variable            | Description                                                                 | Source                                           |
| ------------------- | --------------------------------------------------------------------------- | ------------------------------------------------ |
| `LAKEBASE_ENDPOINT` | Chemin de la ressource endpoint (`projects/.../branches/.../endpoints/...`) | Défini via `valueFrom: postgres` dans `app.yaml` |
| `PGHOST`            | Hôte Lakebase Postgres                                                      | Injecté automatiquement par la plateforme        |
| `PGDATABASE`        | Nom de la base de données PostgreSQL                                        | Injecté automatiquement par la plateforme        |
| `PGSSLMODE`         | Mode TLS (`require`)                                                        | Injecté automatiquement par la plateforme        |
| `PGPORT`            | Port (5432)                                                                 | Injecté automatiquement par la plateforme        |

En développement local, ces valeurs proviennent de votre fichier `.env`. La page [Configuration locale](/docs/lakebase/development#local-setup) explique comment les renseigner.


## Manifeste des plugins \{#plugin-manifest\}

Lorsque vous enregistrez le plugin `lakebase()` dans `createApp`, AppKit génère le fichier `appkit.plugins.json`, qui déclare les ressources requises par le plugin. Exécutez `npx @databricks/appkit plugin sync --write` pour le régénérer après avoir ajouté ou modifié des plugins :

```bash
npx @databricks/appkit plugin sync --write
```

Cela s&#39;exécute automatiquement lors des commandes `npm run dev` et `npm run build`. Versionnez ce fichier avec votre code.

La référence [Configuration d&#39;AppKit](/docs/appkit/v0/configuration) détaille les resource bindings de plugins dans `app.yaml`.


## Hiérarchie des ressources \{#resource-hierarchy\}

Lakebase Postgres organise les ressources en **projets** qui contiennent des **branches**, lesquelles contiennent à leur tour des **computes** et des **bases de données**.

```text
projects/{project_id}
  └── branches/{branch_id}
        ├── endpoints/{endpoint_id}   (compute)
        └── databases/{database_id}
```

* **Projet** : conteneur de premier niveau. Créé avec `databricks postgres create-project`.
* **Branch** : environnement de base de données isolé. Les nouveaux projets disposent par défaut d&#39;une branch `production` contenant une base de données `databricks_postgres`.
* **Compute** : fournit la puissance de traitement et la mémoire d&#39;une branch. Chaque branch se voit attribuer automatiquement un compute `primary` en lecture-écriture. Des réplicas en lecture seule peuvent être ajoutés pour faire monter en charge les lectures.
* **Base de données** : une base de données PostgreSQL au sein d&#39;une branch. Listez-les avec `databricks postgres list-databases <branch>`.

La CLI et l&#39;API désignent les computes sous le terme d&#39;**endpoints** (`ENDPOINT_TYPE_READ_WRITE` pour la lecture-écriture, `ENDPOINT_TYPE_READ_ONLY` pour les read replicas). Les commandes et les chemins de ressources de ce document reprennent cette terminologie.

La [référence de la CLI `postgres`](https://docs.databricks.com/aws/en/oltp/projects/cli) couvre l&#39;ensemble des commandes `databricks postgres`.


## Création de branches \{#branching\}

Les branches créent des environnements de base de données isolés. Lorsque vous créez une branche, Lakebase Postgres copie le schéma et les données de la branche source par copie sur écriture. La création d'une branche est instantanée et vous ne payez que pour les données que vous modifiez.

Chaque nouvelle branche reçoit un endpoint en lecture-écriture `primary` à l'adresse `projects/{project_id}/branches/{branch_id}/endpoints/primary`, qui hérite des `default_endpoint_settings` du projet. Utilisez `create-endpoint` pour ajouter des read replicas (`ENDPOINT_TYPE_READ_ONLY`).

Les branches nécessitent une politique d'expiration (`ttl`, `expire_time` ou `no_expiry: true`). La page [Branch expiration](https://docs.databricks.com/aws/en/oltp/projects/manage-branches#expiration) détaille toutes les options. Pour les commandes CLI, la section [Feature branches](/docs/lakebase/development#feature-branches) fournit des exemples.

:::note
Les identifiants de projet, de branche, d'endpoint et de base de données doivent comporter de 1 à 63 caractères, commencer par une lettre minuscule et ne contenir que des lettres minuscules, des chiffres et des traits d'union.
:::

## Autoscaling \{#autoscaling\}

Les computes se mettent à l&#39;échelle automatiquement entre un minimum et un maximum d&#39;unités de calcul (CU) configurés. Vous définissez cette plage par projet ou par endpoint. Les valeurs CU par défaut, la taille de compute maximale et la contrainte min/max sont des paramètres Lakebase susceptibles d&#39;évoluer ; consultez donc [Autoscaling](https://docs.databricks.com/aws/en/oltp/projects/autoscaling) pour connaître les valeurs actuelles.

La mise à l&#39;échelle au sein de la plage configurée s&#39;effectue sans interruption des connexions. En revanche, modifier le minimum ou le maximum peut provoquer une brève interruption.

<details>
<summary>Configurer l'autoscaling</summary>

```bash title="Common"
databricks postgres update-endpoint \
  projects/my-project/branches/production/endpoints/primary \
  "spec.autoscaling_limit_min_cu,spec.autoscaling_limit_max_cu" \
  --json '{"spec": {"autoscaling_limit_min_cu": 1.0, "autoscaling_limit_max_cu": 8.0}}'
```

```bash title="All Options"
databricks postgres update-endpoint \
  projects/$PROJECT_ID/branches/$BRANCH_ID/endpoints/$ENDPOINT_ID \
  $UPDATE_MASK \
  --json '{"spec": {
    "autoscaling_limit_min_cu": 1.0,
    "autoscaling_limit_max_cu": 8.0
  }}' \
  --no-wait \
  --timeout 10m \
  --debug \
  -o json \
  --target $TARGET \
  --profile $DATABRICKS_PROFILE
```

<!-- cli-options:postgres update-endpoint -->

| Option            | Description                                                                                                     |
| ----------------- | --------------------------------------------------------------------------------------------------------------- |
| `--json`          | chaîne JSON en ligne ou @chemin/vers/fichier.json contenant le corps de la requête (par défaut JSON (0 octets)) |
| `--no-wait`       | ne pas attendre l&#39;état DONE                                                                                 |
| `--timeout`       | durée maximale pour atteindre l&#39;état DONE                                                                   |
| `--debug`         | activer la journalisation de débogage                                                                           |
| `--output`, `-o`  | type de sortie : text ou json (par défaut text)                                                                 |
| `--profile`, `-p` | profil ~/.databrickscfg                                                                                         |
| `--target`, `-t`  | bundle target à utiliser (le cas échéant)                                                                       |

<!-- /cli-options -->

</details>


## Scale to zero \{#scale-to-zero\}

Le [scale to zero](https://docs.databricks.com/aws/en/oltp/projects/scale-to-zero) suspend les computes inactifs pour supprimer les coûts associés. Dès qu&#39;une nouvelle requête arrive, le compute redémarre automatiquement (en général en quelques centaines de millisecondes).

Le délai d&#39;expiration par défaut est de 24 heures. Vous pouvez définir n&#39;importe quelle valeur entre 60 secondes et 7 jours. Pour les branches de développement, des délais plus courts (30 minutes, par exemple) réduisent encore les coûts. Les applications connectées à un compute suspendu subiront une brève pause lors de la première requête : prévoyez une logique de nouvelle tentative de connexion dans votre application.

Au redémarrage d&#39;un compute, le contexte de session est réinitialisé (tables temporaires, requêtes préparées, paramètres de session, pools de connexions).

<details>
<summary>Configurer le scale to zero</summary>

Les valeurs `300s` ci-dessous sont des exemples de délais personnalisés ; il ne s&#39;agit pas de la valeur par défaut (celle-ci est de 24 heures). Vous pouvez définir n&#39;importe quelle valeur entre 60 secondes et 7 jours.

**Valeurs par défaut du projet** (les nouvelles branches héritent de ces paramètres) :

```bash title="Common"
databricks postgres update-project \
  projects/my-project \
  "spec.default_endpoint_settings" \
  --json '{"spec": {"default_endpoint_settings": {"suspend_timeout_duration": "300s"}}}'
```

```bash title="All Options"
databricks postgres update-project \
  projects/$PROJECT_ID \
  $UPDATE_MASK \
  --json '{
    "spec": {
      "default_endpoint_settings": {
        "autoscaling_limit_min_cu": 0.5,
        "autoscaling_limit_max_cu": 1.0,
        "suspend_timeout_duration": "300s"
      }
    }
  }' \
  --no-wait \
  --timeout 10m \
  --debug \
  -o json \
  --target $TARGET \
  --profile $DATABRICKS_PROFILE
```

<!-- cli-options:postgres update-project -->

| Option            | Description                                                                                                    |
| ----------------- | -------------------------------------------------------------------------------------------------------------- |
| `--json`          | chaîne JSON en ligne ou @chemin/vers/fichier.json contenant le corps de la requête (par défaut JSON (0 octet)) |
| `--no-wait`       | ne pas attendre l&#39;état DONE                                                                                |
| `--timeout`       | durée maximale pour atteindre l&#39;état DONE                                                                  |
| `--debug`         | activer la journalisation de débogage                                                                          |
| `--output`, `-o`  | type de sortie : text ou json (par défaut text)                                                                |
| `--profile`, `-p` | profil ~/.databrickscfg                                                                                        |
| `--target`, `-t`  | bundle target à utiliser (le cas échéant)                                                                      |

<!-- /cli-options -->

**Par endpoint** (modifier ou désactiver sur un endpoint existant) :

Utilisez `spec.suspension` comme masque de mise à jour pour toute modification de la suspension via `update-endpoint`.

```bash title="Change timeout"
databricks postgres update-endpoint \
  projects/my-project/branches/production/endpoints/primary \
  "spec.suspension" \
  --json '{"spec": {"suspend_timeout_duration": "300s"}}'
```

```bash title="Disable scale to zero"
databricks postgres update-endpoint \
  projects/my-project/branches/production/endpoints/primary \
  "spec.suspension" \
  --json '{"spec": {"no_suspension": true}}'
```

:::note
Définir `no_suspension: false` n&#39;est pas pris en charge et renvoie une erreur. Pour réactiver le scale to zero après l&#39;avoir désactivé, définissez plutôt `suspend_timeout_duration`.
:::

</details>


## Pour aller plus loin \{#where-to-next\}

Consultez [Développement avec Lakebase Postgres](/docs/lakebase/development) pour la configuration locale, les feature branches et l'API complète du plugin, ou parcourez le [catalogue de modèles](/templates) pour découvrir des patterns complets.