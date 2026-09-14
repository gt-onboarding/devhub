---
title: Développement d'applications
sidebar_label: Développement
sourceOfTruth:
  skills:
    - databricks-apps
  docs:
    - /docs/appkit/v0
    - https://docs.databricks.com/aws/en/dev-tools/databricks-apps/
---

# Développement d'applications \{#app-development\}

Cette page sert de référence CLI et de guide des flux de travail pour Databricks Apps et AppKit. Elle couvre l'ajout de plugins, la génération de projet (scaffolding), le déploiement, la gestion et le dépannage de votre application.

Chaque commande ci-dessous est présentée avec une invocation courante, la liste complète de ses options et un tableau décrivant chacune d'elles. Exécutez `databricks <command> --help` pour connaître le comportement actuel des options : la CLI fait foi.

## Configuration locale \{#local-setup\}

Copiez `.env.example` vers `.env`, puis renseignez l&#39;URL de votre workspace et les identifiants de vos ressources avant d&#39;exécuter `npm run dev`. AppKit s&#39;appuie sur ces valeurs pour établir les connexions locales aux ressources Databricks.

Exemple de fichier `.env` pour une application utilisant [Lakebase Postgres](/docs/lakebase/quickstart) :

```text
DATABRICKS_HOST=https://<workspace>.cloud.databricks.com
LAKEBASE_ENDPOINT=projects/<project>/branches/production/endpoints/primary
```

Si votre application utilise Lakebase, accordez également le rôle `databricks_superuser` à votre utilisateur local avant de l&#39;exécuter en local. Le service principal de l&#39;application crée les schémas et les tables lors du premier déploiement et en devient propriétaire. Sans cette autorisation, votre identité locale ne peut pas accéder à ces objets :

```sql
GRANT databricks_superuser TO "<your-email>";
```

Consultez [Développement Lakebase](/docs/lakebase/development#local-database-access) pour découvrir le workflow complet d&#39;accès local.

Pour tester sur des données de production sans redéployer, consultez le [pont distant](/docs/appkit/v0/development/remote-bridge).


## Ajouter un plugin \{#add-a-plugin\}

Pour ajouter un plugin à une application existante, importez-le et enregistrez-le dans `createApp`, au sein de `server/server.ts` :

```typescript
import { createApp, genie, lakebase, server } from "@databricks/appkit";

const AppKit = await createApp({
  plugins: [server(), lakebase(), genie()],
});
```

Régénérez ensuite `appkit.plugins.json` avec les besoins en ressources mis à jour :

```bash
npx @databricks/appkit plugin sync --write
```

Cette opération s&#39;exécute automatiquement lors de `npm run dev` et `npm run build`. Commitez le fichier `appkit.plugins.json` mis à jour avec votre code : c&#39;est lui qui indique au pipeline de déploiement les ressources à provisionner.

Consultez la [référence des plugins AppKit](/docs/appkit/v0/plugins) pour les options de configuration de chaque plugin, ou [Créer des plugins personnalisés](/docs/appkit/v0/plugins/custom-plugins) pour ajouter les vôtres.


## Découvrir les plugins \{#discover-plugins\}

Répertoriez les plugins disponibles et les champs de ressources qu&#39;ils requièrent :

```bash title="Common"
databricks apps manifest
```

```bash title="All Options"
databricks apps manifest \
  --template $TEMPLATE_URL \
  --branch $BRANCH \
  --version $APPKIT_VERSION \
  --debug \
  -o json \
  --target $TARGET \
  --var "key=value" \
  --profile $DATABRICKS_PROFILE
```

<!-- cli-options:apps manifest -->

| Option            | Description                                                                                                               |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `--branch`        | Branche ou tag Git (pour les modèles GitHub, mutuellement exclusif avec --version)                                        |
| `--template`      | Chemin du modèle (répertoire local ou URL GitHub)                                                                         |
| `--version`       | Version d&#39;AppKit pour le modèle par défaut (valeur par défaut : main, utilisez &#39;latest&#39; pour la branche main) |
| `--debug`         | activer la journalisation de débogage                                                                                     |
| `--output`, `-o`  | type de sortie : text ou json (text par défaut)                                                                           |
| `--profile`, `-p` | profil ~/.databrickscfg                                                                                                   |
| `--target`, `-t`  | bundle target à utiliser (le cas échéant)                                                                                 |
| `--var`           | définir les valeurs des variables déclarées dans la configuration du bundle. Exemple : --var=&quot;key=value&quot;        |

<!-- /cli-options -->


## Options de scaffold \{#scaffold-options\}

Utilisez `databricks apps init` pour générer le scaffold d&#39;un nouveau projet AppKit. Le [Démarrage rapide Apps](/docs/apps/quickstart) présente la méthode la plus rapide. Ces options permettent un scaffolding non interactif ou avancé.

```bash title="Common"
databricks apps init --name my-app
```

```bash title="All Options"
databricks apps init \
  --name $APP_NAME \
  --features lakebase,analytics \
  --set lakebase.postgres.project=projects/$PROJECT_ID \
  --set lakebase.postgres.branch=projects/$PROJECT_ID/branches/production \
  --set lakebase.postgres.database=projects/$PROJECT_ID/branches/production/databases/$DB_NAME \
  --set analytics.sql-warehouse.id=$WAREHOUSE_ID \
  --description "My App" \
  --output-dir $OUTPUT_DIR \
  --template $TEMPLATE_URL \
  --branch $BRANCH \
  --deploy \
  --run none \
  --skip-install \
  --version $APPKIT_VERSION \
  --debug \
  -o json \
  --target $TARGET \
  --var "key=value" \
  --profile $DATABRICKS_PROFILE
```

<!-- cli-options:apps init -->

| Option            | Description                                                                                                                |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `--branch`        | Branche ou tag Git (pour les modèles GitHub, mutuellement exclusif avec --version)                                         |
| `--deploy`        | Déployer l&#39;application après sa création                                                                               |
| `--description`   | Description de l&#39;application                                                                                           |
| `--features`      | Fonctionnalités/plugins à activer (séparés par des virgules, tels que définis dans le manifeste du modèle)                 |
| `--output-dir`    | Répertoire dans lequel écrire le projet                                                                                    |
| `--run`           | Exécuter l&#39;application après sa création (none, dev, dev-remote)                                                       |
| `--set`           | Définir des valeurs de ressources (format : plugin.resourceKey.field=value, plusieurs possibles)                           |
| `--skip-install`  | Ignorer l&#39;installation des dépendances du projet (par ex. npm install / uv sync). Incompatible avec --run.             |
| `--template`      | Chemin du modèle (répertoire local ou URL GitHub)                                                                          |
| `--version`       | Version d&#39;AppKit à utiliser (par défaut : détection automatique, utilisez &#39;latest&#39; pour la branche principale) |
| `--debug`         | activer la journalisation de débogage                                                                                      |
| `--output`, `-o`  | type de sortie : text ou json (text par défaut)                                                                            |
| `--profile`, `-p` | profil ~/.databrickscfg                                                                                                    |
| `--target`, `-t`  | bundle target à utiliser (le cas échéant)                                                                                  |
| `--var`           | définir les valeurs des variables définies dans la configuration du bundle. Exemple : --var=&quot;key=value&quot;          |

<!-- /cli-options -->

L&#39;option `--name` désactive les invites et applique les valeurs par défaut aux options non spécifiées. Les noms d&#39;applications doivent être en minuscules, séparés par des traits d&#39;union et comporter au maximum 26 caractères. Exécutez `databricks apps manifest` pour afficher les plugins disponibles et leurs clés `--set`.


## Configuration de l&#39;environnement \{#environment-configuration\}

**En local** (`npm run dev`) : les variables proviennent du fichier `.env` situé à la racine du projet.

**Une fois déployé** : les variables proviennent des entrées `env` de `app.yaml`. Utilisez `value` pour les chaînes de caractères simples et `valueFrom` pour les resource bindings :

```yaml
env:
  - name: LAKEBASE_ENDPOINT
    valueFrom: postgres
  - name: WAREHOUSE_ID
    valueFrom: sql-warehouse
  - name: APP_LOG_LEVEL
    value: info
```

Les ressources référencées par `valueFrom` doivent être déclarées dans `databricks.yml`. Consultez [Configuration de l&#39;application](/docs/apps/configuration#resources) pour la liste complète des ressources.


## Liste de contrôle avant déploiement \{#pre-deploy-checklist\}

Avant de déployer en production :

- L'application écoute sur `0.0.0.0`, sur le port `DATABRICKS_APP_PORT`
- La commande de `app.yaml` utilise la syntaxe tableau (pas de chaîne shell)
- Aucun fichier de plus de 10 Mo dans le projet
- Les secrets utilisent `valueFrom` (jamais `value`)
- `databricks.yml` déclare toutes les ressources requises
- `databricks apps validate` s'exécute sans erreur (`--skip-tests` ignore les tests pour une exécution plus rapide)
- `npm run build` aboutit en local

## Valider \{#validate\}

Lancez la validation depuis le répertoire de votre projet d&#39;application avant de déployer :

```bash
databricks apps validate --profile $DATABRICKS_PROFILE
```

La validation exécute une compilation, une vérification des types et une analyse statique. Passez `--skip-tests` pour une exécution plus rapide.


## Déploiement \{#deploy\}

```bash title="Common"
databricks apps deploy
```

```bash title="All Options"
databricks apps deploy $APP_NAME \
  --deployment-id $DEPLOYMENT_ID \
  --json @$CONFIG_FILE \
  --source-code-path $SOURCE_PATH \
  --git-branch $GIT_BRANCH \
  --git-commit $GIT_COMMIT \
  --git-tag $GIT_TAG \
  --git-source-code-path $GIT_SOURCE_PATH \
  --mode SNAPSHOT \
  --auto-approve \
  --skip-validation \
  --skip-tests \
  --force \
  --no-wait \
  --timeout 20m \
  --debug \
  -o json \
  --target $TARGET \
  --var "key=value" \
  --profile $DATABRICKS_PROFILE
```

<!-- cli-options:apps deploy -->

| Option                   | Description                                                                                                        |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| `--auto-approve`         | Ignorer les approbations interactives susceptibles d&#39;être requises pour le déploiement.                        |
| `--deployment-id`        | Identifiant unique du déploiement.                                                                                 |
| `--force`                | Forcer le contournement de la validation de la branche Git.                                                        |
| `--git-branch`           | Branche Git à partir de laquelle déployer.                                                                         |
| `--git-commit`           | SHA du commit Git à partir duquel déployer.                                                                        |
| `--git-source-code-path` | Chemin relatif du code source de l&#39;app dans le dépôt Git. Par défaut, la racine du dépôt.                      |
| `--git-tag`              | Tag Git à partir duquel déployer.                                                                                  |
| `--json`                 | chaîne JSON en ligne ou @chemin/vers/fichier.json contenant le corps de la requête (par défaut JSON (0 bytes))     |
| `--mode`                 | Mode de gestion du code source par le déploiement. Valeurs prises en charge : [AUTO&#95;SYNC, SNAPSHOT]            |
| `--no-wait`              | ne pas attendre d&#39;atteindre l&#39;état SUCCEEDED                                                               |
| `--skip-tests`           | Ignorer l&#39;exécution des tests pendant la validation (par défaut true)                                          |
| `--skip-validation`      | Ignorer la validation du projet (build, typecheck, lint)                                                           |
| `--source-code-path`     | Chemin du code source dans le système de fichiers du workspace utilisé pour créer le déploiement de l&#39;app.     |
| `--timeout`              | durée maximale pour atteindre l&#39;état SUCCEEDED (par défaut 20m0s)                                              |
| `--debug`                | activer la journalisation de débogage                                                                              |
| `--output`, `-o`         | type de sortie : text ou json (par défaut text)                                                                    |
| `--profile`, `-p`        | profil ~/.databrickscfg                                                                                            |
| `--target`, `-t`         | bundle target à utiliser (le cas échéant)                                                                          |
| `--var`                  | définir les valeurs des variables déclarées dans la configuration du bundle. Exemple : --var=&quot;key=value&quot; |

<!-- /cli-options -->

La CLI valide la configuration, compile le projet, le téléverse et démarre l&#39;app. Par défaut, elle exécute la même validation de projet que `databricks apps validate` (build, typecheck, lint). Utilisez `--skip-validation` pour ignorer cette étape. L&#39;option `--source-code-path` est inutile lors d&#39;un déploiement depuis un projet AppKit généré par scaffold.


### Vérifier le déploiement \{#verify-the-deployment\}

Vérifiez que l&#39;application a bien été déployée :

```bash title="Common"
databricks apps get my-app -o json
```

```bash title="All Options"
databricks apps get $APP_NAME \
  -o json \
  --debug \
  --target $TARGET \
  --var "key=value" \
  --profile $DATABRICKS_PROFILE
```

<!-- cli-options:apps get -->

| Option            | Description                                                                                                        |
| ----------------- | ------------------------------------------------------------------------------------------------------------------ |
| `--debug`         | activer la journalisation de débogage                                                                              |
| `--output`, `-o`  | type de sortie : text ou json (text par défaut)                                                                    |
| `--profile`, `-p` | profil ~/.databrickscfg                                                                                            |
| `--target`, `-t`  | bundle target à utiliser (le cas échéant)                                                                          |
| `--var`           | définir les valeurs des variables déclarées dans la configuration du bundle. Exemple : --var=&quot;key=value&quot; |

<!-- /cli-options -->

<details>
<summary>Exemple de sortie</summary>

```json
{
  "name": "my-app",
  "url": "https://my-app-1234567890.us-west-2.databricksapps.com",
  "description": "A Databricks App powered by AppKit",
  "compute_size": "MEDIUM",
  "app_status": {
    "message": "App has status: App is running",
    "state": "RUNNING"
  },
  "compute_status": {
    "message": "App compute is running.",
    "state": "ACTIVE"
  },
  "active_deployment": {
    "deployment_id": "a1b2c3d4e5f6",
    "source_code_path": "/Workspace/Users/you@example.com/.bundle/my-app/default/files",
    "status": {
      "message": "App started successfully",
      "state": "SUCCEEDED"
    }
  },
  "resources": [
    {
      "name": "postgres",
      "postgres": {
        "branch": "projects/my-project/branches/production",
        "database": "projects/my-project/branches/production/databases/db-abc123",
        "permission": "CAN_CONNECT_AND_CREATE"
      }
    }
  ],
  "service_principal_client_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
}
```

</details>

Consultez les journaux :

```bash title="Common"
databricks apps logs my-app
```

```bash title="All Options"
databricks apps logs $APP_NAME \
  --follow \
  --tail-lines 200 \
  --timeout 5m \
  --source APP \
  --search "$SEARCH_TERM" \
  --output-file $LOG_FILE \
  --debug \
  -o json \
  --target $TARGET \
  --var "key=value" \
  --profile $DATABRICKS_PROFILE
```

<!-- cli-options:apps logs -->

| Option            | Description                                                                                                            |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `--follow`, `-f`  | Poursuit le streaming des journaux jusqu&#39;à interruption.                                                           |
| `--tail-lines`    | Nombre de lignes de journal récentes à afficher avant le streaming. Définir à 0 pour tout afficher. (par défaut : 200) |
| `--timeout`       | Durée maximale du streaming lorsque --follow est activé. 0 désactive le délai d&#39;expiration.                        |
| `--search`        | Envoie un terme de recherche au service de journalisation avant le streaming.                                          |
| `--source`        | Limite les journaux aux sources APP et/ou SYSTEM.                                                                      |
| `--output-file`   | Chemin de fichier facultatif pour écrire les journaux en plus de stdout.                                               |
| `--debug`         | active la journalisation de débogage                                                                                   |
| `--output`, `-o`  | type de sortie : text ou json (par défaut : text)                                                                      |
| `--profile`, `-p` | profil ~/.databrickscfg                                                                                                |
| `--target`, `-t`  | bundle target à utiliser (le cas échéant)                                                                              |
| `--var`           | définit les valeurs des variables déclarées dans la configuration du bundle. Exemple : --var=&quot;key=value&quot;     |

<!-- /cli-options -->


<details>
<summary>Exemple de sortie de journal</summary>

```text
[SYSTEM] [INFO] Starting Databricks Apps runtime...
[SYSTEM] [INFO] Starting deployment a1b2c3d4e5f6...
[SYSTEM] [INFO] Downloading source code from /Workspace/Users/.../src/a1b2c3d4e5f6
[SYSTEM] [INFO] Installing dependencies...
[BUILD] added 899 packages, and audited 900 packages in 21s
[SYSTEM] [INFO] Dependencies installed successfully.
[SYSTEM] [INFO] Running build script npm run build:server && npm run build:client
[BUILD] ✔ Build complete in 30ms
[BUILD] ✓ built in 2.80s
[SYSTEM] [INFO] Build completed successfully.
[SYSTEM] [INFO] Starting app with command: [npm run start]
[APP] [appkit:lakebase] Lakebase pool initialized
[APP] [appkit:server] Server running on http://0.0.0.0:8000
[APP] [appkit:server] Mode: production (static)
```

</details>


## Gestion des applications \{#managing-apps\}

```bash title="Common"
databricks apps stop my-app
databricks apps start my-app
databricks apps delete my-app
```

```bash title="All Options"
databricks apps stop $APP_NAME \
  --no-wait \
  --timeout 20m \
  --debug \
  -o json \
  --target $TARGET \
  --var "key=value" \
  --profile $DATABRICKS_PROFILE

databricks apps start $APP_NAME \
  --no-wait \
  --timeout 20m \
  --debug \
  -o json \
  --target $TARGET \
  --var "key=value" \
  --profile $DATABRICKS_PROFILE

databricks apps delete $APP_NAME \
  --auto-approve \
  --force-lock \
  --debug \
  -o json \
  --target $TARGET \
  --var "key=value" \
  --profile $DATABRICKS_PROFILE
```


#### Options de `apps stop` \{#apps-stop-options\}

<!-- cli-options:apps stop -->

| Option            | Description                                                                   |
| ----------------- | ----------------------------------------------------------------------------- |
| `--no-wait`       | ne pas attendre le passage à l'état STOPPED                                   |
| `--timeout`       | durée maximale pour atteindre l'état STOPPED (par défaut 20m0s)               |
| `--debug`         | activer la journalisation de débogage                                         |
| `--output`, `-o`  | type de sortie : text ou json (par défaut text)                               |
| `--profile`, `-p` | profil ~/.databrickscfg                                                       |
| `--target`, `-t`  | bundle target à utiliser (le cas échéant)                                     |
| `--var`           | définir les valeurs des variables déclarées dans la configuration du bundle. Exemple : --var="key=value" |

<!-- /cli-options -->

#### Options de `apps start` \{#apps-start-options\}

<!-- cli-options:apps start -->

| Option            | Description                                                                                         |
| ----------------- | --------------------------------------------------------------------------------------------------- |
| `--no-wait`       | ne pas attendre le passage à l'état ACTIVE                                                          |
| `--timeout`       | durée maximale pour atteindre l'état ACTIVE (20m0s par défaut)                                      |
| `--debug`         | activer la journalisation de débogage                                                                |
| `--output`, `-o`  | type de sortie : text ou json (text par défaut)                                                     |
| `--profile`, `-p` | profil ~/.databrickscfg                                                                             |
| `--target`, `-t`  | bundle target à utiliser (le cas échéant)                                                           |
| `--var`           | définir les valeurs des variables déclarées dans la configuration du bundle. Exemple : --var="key=value" |

<!-- /cli-options -->

#### Options de `apps delete` \{#apps-delete-options\}

<!-- cli-options:apps delete -->

| Option            | Description                                                                   |
| ----------------- | ----------------------------------------------------------------------------- |
| `--auto-approve`  | Ignorer les approbations interactives lors de la suppression des ressources et des fichiers |
| `--force-lock`    | Forcer l'acquisition du verrou de déploiement.                                 |
| `--debug`         | activer la journalisation de débogage                                          |
| `--output`, `-o`  | type de sortie : text ou json (text par défaut)                                |
| `--profile`, `-p` | profil ~/.databrickscfg                                                        |
| `--target`, `-t`  | bundle target à utiliser (le cas échéant)                                      |
| `--var`           | définir les valeurs des variables déclarées dans la configuration du bundle. Exemple : --var="key=value" |

<!-- /cli-options -->

`apps delete` demande une confirmation. Passez `--auto-approve` en CI pour ignorer cette invite.

## CI/CD \{#cicd\}

Pour automatiser les déploiements en CI, définissez `DATABRICKS_HOST` et `DATABRICKS_TOKEN` (ou utilisez OAuth avec `DATABRICKS_CLIENT_ID` et `DATABRICKS_CLIENT_SECRET`) :

```bash
DATABRICKS_HOST=https://<workspace>.cloud.databricks.com \
DATABRICKS_TOKEN=dapi... \
databricks apps deploy
```

Ou utilisez un profil préconfiguré :

```bash
databricks apps deploy --profile ci-profile
```

Consultez la [documentation sur l&#39;authentification de la Databricks CLI](/docs/tools/databricks-cli#authenticate) pour connaître toutes les méthodes d&#39;authentification.


## Dépannage \{#troubleshooting\}

Pour aller plus loin, consultez [Deploy apps](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/deploy#troubleshoot) ainsi que le [pont distant AppKit](/docs/appkit/v0/development/remote-bridge) pour les problèmes de connexion locale.

- **Le déploiement de l'app échoue** : consultez les journaux pour repérer les messages d'erreur, validez la syntaxe du fichier `app.yaml` et vérifiez que les secrets et les variables d'environnement de la section `env` se résolvent correctement. Assurez-vous que toutes les dépendances sont incluses ou installées.
- **Erreurs 401 (authentification)** : vérifiez que votre jeton est valide (`databricks auth token --profile <PROFILE>`), qu'il n'a pas expiré et qu'il inclut les scopes OAuth requis. Les scopes de votre jeton doivent former un sur-ensemble de ceux configurés pour l'[autorisation utilisateur](/docs/appkit/v0/plugins/execution-context) de l'app.
- **Erreurs 403 (permission refusée)** : vérifiez que vous disposez de la permission `CAN USE` sur l'app. Des scopes OAuth insuffisants peuvent eux aussi provoquer des erreurs 403, même si les permissions sont correctes.
- **Erreurs 404 (app introuvable)** : vérifiez que le nom de l'app et l'URL du workspace sont corrects, que l'app est déployée et en cours d'exécution, et que le chemin de l'endpoint existe.
- **Le déploiement Git échoue** : pour les dépôts privés, vérifiez que le service principal de l'app dispose d'un identifiant Git configuré. Si vous déployez via la CLI, l'API ou les DAB, créez d'abord l'app, puis ajoutez l'identifiant Git.

## Documentation AppKit \{#appkit-docs\}

Accédez à la référence de l&#39;API AppKit, à la documentation des composants et à celle des plugins depuis le terminal :

```bash
npx @databricks/appkit docs                        # parcourir l'index de la documentation
npx @databricks/appkit docs --full                 # index complet avec toutes les entrées de l'API
npx @databricks/appkit docs "<query-or-doc-path>"  # afficher une section ou un fichier précis
```

Exécutez la commande sans argument pour parcourir l&#39;index. Pratique lorsque vous développez avec un assistant de codage IA : orientez-le vers cette ressource plutôt que de le laisser deviner la structure des API, ou consultez la [référence AppKit](/docs/appkit/v0) sur ce site.


## Pour aller plus loin \{#where-to-next\}

Parcourez le [catalogue de modèles](/templates) pour commencer à développer, ou enrichissez votre application de nouvelles capacités : [Lakebase Postgres](/docs/lakebase/overview) pour le stockage persistant ou [Agent Bricks](/docs/agents/overview) pour les fonctionnalités d'IA.