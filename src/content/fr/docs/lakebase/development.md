---
title: Développement avec Lakebase Postgres
sidebar_label: Développement
sourceOfTruth:
  skills:
    - databricks-lakebase
    - databricks-dabs
  docs:
    - /docs/appkit/v0/plugins/lakebase
    - https://docs.databricks.com/aws/en/oltp/
---

# Développement avec Lakebase Postgres \{#lakebase-postgres-development\}

Cette page traite du développement avec Lakebase Postgres depuis une application AppKit. Pour Lakebase à proprement parler (projets, branches, autoscaling, connectivité), consultez la [documentation Lakebase](https://docs.databricks.com/aws/en/oltp/) ou l'agent skill [`databricks-lakebase`](/docs/tools/ai-tools/agent-skills).

## API du plugin AppKit \{#appkit-plugin-api\}

Le plugin `lakebase()` fournit un `pg.Pool` standard avec actualisation automatique du token OAuth. Une fois enregistré, accédez-y via `AppKit.lakebase` :

```typescript
import { createApp, lakebase, server } from "@databricks/appkit";

const AppKit = await createApp({
  plugins: [server(), lakebase()],
});

// Requête paramétrée standard
const { rows } = await AppKit.lakebase.query<{ id: number; name: string }>(
  "SELECT id, name FROM app.items WHERE active = $1",
  [true],
);

// Configuration prête à l'emploi pour les ORM (Drizzle, Prisma, TypeORM, etc.)
const ormConfig = AppKit.lakebase.getOrmConfig();
// Renvoie : { host, port, database, ssl, user, ... }

// Configuration compatible pg
const pgConfig = AppKit.lakebase.getPgConfig();

// pg.Pool brut pour un usage avancé
const pool = AppKit.lakebase.pool;
```


### Configuration du pool \{#pool-configuration\}

Remplacez les valeurs par défaut du pool de connexions en passant un objet `pool` :

```typescript
lakebase({
  pool: {
    max: 10, // nombre maximal de connexions (par défaut : 10)
    connectionTimeoutMillis: 5000, // délai d'attente de connexion en ms (par défaut : 10000)
    idleTimeoutMillis: 30000, // délai d'inactivité en ms (par défaut : 30000)
  },
});
```

La valeur par défaut `max: 10` s&#39;applique au pool partagé du principal de service. Les pools par utilisateur en mode « au nom de » (créés par `asUser(req)`) utilisent par défaut `max: 3`.


### Intégration de la mise en cache \{#caching-integration\}

Lakebase Postgres sert également de socle au [plugin de mise en cache AppKit](/docs/appkit/v0/plugins/caching) lorsqu'il est opérationnel. Pour l'API complète, l'intégration ORM et la configuration de la connexion, consultez la [référence du plugin](/docs/appkit/v0/plugins/lakebase).

## Modèle d'authentification \{#auth-model\}

Lakebase Postgres authentifie les connexions à la base de données à l'aide de jetons OAuth ou de mots de passe Postgres natifs. La méthode dépend de l'environnement d'exécution de votre application.

**Applications déployées** : lorsque vous l'ajoutez comme ressource à une Databricks App, Databricks crée automatiquement un service principal, lui accorde le rôle Postgres correspondant et injecte les informations de connexion sous forme de variables d'environnement. Le plugin `lakebase()` d'AppKit gère automatiquement l'actualisation des jetons OAuth.

**Développement local** : votre identité Databricks personnelle se connecte avec un jeton OAuth généré par `databricks postgres generate-database-credential`. Les jetons expirent au bout d'une heure, mais l'expiration n'est vérifiée qu'au moment de la connexion : les connexions déjà ouvertes restent actives après l'expiration du jeton. Exécutez `databricks apps deploy` au moins une fois avant de lancer `npm run dev`. La section [Configuration locale](#local-setup) explique pourquoi l'ordre est important et que faire en cas d'erreurs de permissions.

[About authentication](https://docs.databricks.com/aws/en/oltp/projects/authentication) traite de l'authentification par mot de passe Postgres, de la rotation des jetons et des flux de machine à machine.

## Configuration locale \{#local-setup\}

`databricks apps init` renseigne le fichier `.env` avec les valeurs de connexion Lakebase Postgres appropriées. Exécutez `databricks apps deploy` avant `npm run dev`. Le déploiement met en place une identité gérée (le service principal de l'application), qui crée le schéma `app` et ses tables au premier démarrage et en devient propriétaire. Si vous lancez `npm run dev` en premier, ce sont vos identifiants personnels qui créent ces objets. L'application déployée ne peut alors plus y accéder et renvoie l'erreur `permission denied for schema app`.

### Accès local à la base de données \{#local-database-access\}

Si vous avez créé le projet Lakebase Postgres, votre identité dispose déjà des accès nécessaires. Une fois `databricks apps deploy` exécuté une première fois, `npm run dev` fonctionne.

Pour les collaborateurs ayant besoin d&#39;un accès local en lecture/écriture, accordez-leur un rôle sur la branch depuis l&#39;interface Lakebase (**Roles &amp; Databases**). L&#39;authentification par mot de passe Postgres constitue une alternative à OAuth : activez les connexions par mot de passe, créez un rôle avec mot de passe, puis utilisez ce mot de passe comme `PGPASSWORD` dans `.env`. La page [About authentication](https://docs.databricks.com/aws/en/oltp/projects/authentication) détaille les étapes pour les deux méthodes.

Vous pouvez également générer un identifiant éphémère à utiliser avec n&#39;importe quel client PostgreSQL (DBeaver, pgAdmin, DataGrip ou un pilote de langage) :

```bash
databricks postgres generate-database-credential \
  projects/my-project/branches/production/endpoints/primary
```

La [documentation du plugin AppKit : développement local](/docs/appkit/v0/plugins/lakebase#local-development) présente d&#39;autres options de permissions plus fines pour les équipes qui ont besoin d&#39;un accès restreint à un schéma.


## Se connecter avec psql \{#connect-with-psql\}

`databricks psql` ouvre une session PostgreSQL interactive sur un endpoint de branch. `psql` doit être installé localement. Si aucune cible n&#39;est précisée, la commande vous invite à choisir parmi les bases de données auxquelles vous avez accès.

```bash title="Common"
databricks psql --project my-project
```

```bash title="All Options"
databricks psql \
  --project $PROJECT_ID \
  --branch $BRANCH_ID \
  --endpoint $ENDPOINT_ID \
  --autoscaling \
  --max-retries 3 \
  --debug \
  -o json \
  --target $TARGET \
  --profile $DATABRICKS_PROFILE
```

<!-- cli-options:psql -->

| Option            | Description                                                |
| ----------------- | ---------------------------------------------------------- |
| `--autoscaling`   | Afficher uniquement les projets Lakebase Autoscaling       |
| `--project`       | ID du projet                                               |
| `--branch`        | ID de la branch (par défaut : sélection automatique)       |
| `--endpoint`      | ID de l&#39;endpoint (par défaut : sélection automatique)  |
| `--max-retries`   | Tentatives de connexion ; 0 pour désactiver (3 par défaut) |
| `--debug`         | activer la journalisation de débogage                      |
| `--output`, `-o`  | type de sortie : text ou json (text par défaut)            |
| `--profile`, `-p` | profil ~/.databrickscfg                                    |
| `--target`, `-t`  | bundle target à utiliser (le cas échéant)                  |

<!-- /cli-options -->

Passez des arguments supplémentaires directement à `psql` après un séparateur `--`, par exemple `databricks psql --project my-project -- -c "SELECT 1"`.


## Feature branches \{#feature-branches\}

Utilisez les branches Lakebase Postgres pour isoler les modifications de schéma et tester les migrations sans impacter la production :

```bash title="Common"
databricks postgres create-branch projects/my-project feature-xyz \
  --json '{"spec": {"no_expiry": true}}'
```

```bash title="All Options"
databricks postgres create-branch \
  projects/$PROJECT_ID \
  $BRANCH_ID \
  --json '{"spec": {"source_branch": "projects/$PROJECT_ID/branches/$SOURCE_BRANCH_ID", "no_expiry": true}}' \
  --replace-existing \
  --debug \
  -o json \
  --target $TARGET \
  --no-wait \
  --timeout 10m \
  --profile $DATABRICKS_PROFILE
```

<!-- cli-options:postgres create-branch -->

| Option               | Description                                                                                                    |
| -------------------- | -------------------------------------------------------------------------------------------------------------- |
| `--json`             | chaîne JSON en ligne ou @chemin/vers/fichier.json contenant le corps de la requête (par défaut JSON (0 octet)) |
| `--no-wait`          | ne pas attendre l&#39;état DONE                                                                                |
| `--replace-existing` | Si true, met à jour la branch si elle existe déjà au lieu de renvoyer une erreur.                              |
| `--timeout`          | durée maximale d&#39;attente de l&#39;état DONE                                                                |
| `--debug`            | activer la journalisation de débogage                                                                          |
| `--output`, `-o`     | type de sortie : text ou json (par défaut text)                                                                |
| `--profile`, `-p`    | profil ~/.databrickscfg                                                                                        |
| `--target`, `-t`     | bundle target à utiliser (le cas échéant)                                                                      |

<!-- /cli-options -->

Un endpoint `primary` en lecture-écriture est créé automatiquement et hérite des `default_endpoint_settings` du projet. Les branches nécessitent une politique d&#39;expiration (`ttl`, `expire_time` ou `no_expiry: true`). La section [Expiration des branches](https://docs.databricks.com/aws/en/oltp/projects/manage-branches#expiration) détaille les politiques disponibles.

Supprimez-la une fois terminé :

```bash title="Common"
databricks postgres delete-branch projects/my-project/branches/feature-xyz
```

```bash title="All Options"
databricks postgres delete-branch \
  projects/$PROJECT_ID/branches/$BRANCH_ID \
  --purge \
  --no-wait \
  --timeout 10m \
  --debug \
  -o json \
  --target $TARGET \
  --profile $DATABRICKS_PROFILE
```

<!-- cli-options:postgres delete-branch -->

| Option            | Description                                                                 |
| ----------------- | --------------------------------------------------------------------------- |
| `--no-wait`       | ne pas attendre le passage à l&#39;état DONE                                |
| `--purge`         | Si true, supprime définitivement la branch ; si false, suppression logique. |
| `--timeout`       | durée maximale pour atteindre l&#39;état DONE                               |
| `--debug`         | activer la journalisation de débogage                                       |
| `--output`, `-o`  | type de sortie : text ou json (text par défaut)                             |
| `--profile`, `-p` | profil ~/.databrickscfg                                                     |
| `--target`, `-t`  | bundle target à utiliser (le cas échéant)                                   |

<!-- /cli-options -->


## Applications hors plateforme \{#off-platform-apps\}

Pour les applications hébergées en dehors de Databricks (AWS, Vercel, Netlify, etc.), la plateforme n&#39;injecte pas les informations de connexion et n&#39;actualise pas automatiquement les jetons OAuth. La rotation des jetons incombe à l&#39;application. [À propos de l&#39;authentification Lakebase](https://docs.databricks.com/aws/en/oltp/projects/authentication) traite de la rotation des jetons et des modèles d&#39;accès machine à machine. Le modèle [Lakebase Off-Platform](/templates/lakebase-off-platform) fournit une implémentation complète, avec configuration de l&#39;environnement et intégration de Drizzle ORM.

Pour provisionner et établir la connexion sans passer par un modèle, créez un projet, récupérez son endpoint et sa base de données, puis connectez-vous :

```bash
databricks postgres create-project <project-id>
databricks postgres list-endpoints projects/<project-id>/branches/production -o json
databricks postgres list-databases projects/<project-id>/branches/production -o json
databricks psql --project <project-id>
```

`create-project` crée un projet avec une branch `production` par défaut, une base de données `databricks_postgres` et un endpoint en lecture-écriture. Si vous ne disposez pas de `psql`, exécutez `databricks postgres generate-database-credential <endpoint-path>` et utilisez le jeton renvoyé comme mot de passe (le nom d&#39;utilisateur est votre adresse e-mail Databricks) avec n&#39;importe quel client PostgreSQL. Consultez la [documentation Lakebase](https://docs.databricks.com/aws/en/oltp/) ou l&#39;agent skill [`databricks-lakebase`](/docs/tools/ai-tools/agent-skills) pour le déroulement complet et les options disponibles.

Les valeurs dont vous avez besoin dans la sortie de `list-endpoints` et `list-databases` :

| Valeur                                | Chemin JSON                    | Utilisée pour                |
| ------------------------------------- | ------------------------------ | ---------------------------- |
| Hôte de l&#39;endpoint                | `status.hosts.host`            | `PGHOST`                     |
| Chemin de ressource de l&#39;endpoint | `name`                         | `LAKEBASE_ENDPOINT`          |
| Chemin de ressource de la base        | `name` (depuis list-databases) | `lakebase.postgres.database` |
| Nom de la base PostgreSQL             | `status.postgres_database`     | `PGDATABASE`                 |


## Opérations de longue durée \{#long-running-operations\}

Par défaut, les commandes de création, de mise à jour et de suppression sont bloquantes jusqu&#39;à la fin de l&#39;opération. Utilisez `--no-wait` pour rendre la main immédiatement et interroger l&#39;état :

```bash
databricks postgres create-project my-project \
  --json '{"spec": {"display_name": "My Project"}}' \
  --no-wait

databricks postgres get-operation projects/my-project/operations/<operation-id>
```


## Declarative Automation Bundles \{#declarative-automation-bundles\}

Les Declarative Automation Bundles (DAB) permettent de définir l&#39;infrastructure Lakebase Postgres sous forme de code dans `databricks.yml`, versionnée en même temps que votre application. Un bundle déclare `postgres_projects`, `postgres_branches` et `postgres_endpoints` sous `resources`.

<details>
<summary>Exemple de <code>databricks.yml</code> avec un projet, une branche de développement et un réplica en lecture seule</summary>

```yaml
bundle:
  name: my-lakebase-app

resources:
  postgres_projects:
    my_app:
      project_id: "my-lakebase-app"
      display_name: "My Lakebase Postgres App"
      pg_version: 17
      history_retention_duration: "172800s"
      default_endpoint_settings:
        autoscaling_limit_min_cu: 0.5
        autoscaling_limit_max_cu: 1.0
        suspend_timeout_duration: "300s"
        pg_settings:
          log_min_duration_statement: "1000"

  postgres_branches:
    dev_branch:
      parent: ${resources.postgres_projects.my_app.id}
      branch_id: "dev"
      no_expiry: true
      is_protected: false

  postgres_endpoints:
    read_replica:
      parent: ${resources.postgres_branches.dev_branch.id}
      endpoint_id: "replica"
      endpoint_type: "ENDPOINT_TYPE_READ_ONLY"
      autoscaling_limit_min_cu: 0.5
      autoscaling_limit_max_cu: 0.5
```

</details>


### Valider et déployer \{#validate-and-deploy\}

```bash
databricks bundle validate
databricks bundle deploy
```

`bundle deploy` est idempotent. Cette commande crée les nouvelles ressources et met à jour celles qui existent déjà pour les aligner sur la configuration. Contrairement aux Databricks Jobs ou aux Apps, il n&#39;y a pas d&#39;étape `bundle run` : les ressources Lakebase Postgres sont actives dès leur déploiement. La [documentation des Declarative Automation Bundles](https://docs.databricks.com/aws/en/dev-tools/bundles/) présente l&#39;ensemble des options, et l'agent skill [`databricks-dabs`](/docs/tools/ai-tools/agent-skills) permet de rédiger et de valider des bundles.


## Masques de mise à jour \{#update-masks\}

Les commandes de mise à jour exigent un masque de mise à jour indiquant les champs à modifier. La charge utile `--json` contient les nouvelles valeurs. Seuls les champs inclus dans le masque sont modifiés.

```bash
databricks postgres update-branch \
  projects/my-project/branches/production \
  spec.is_protected \
  --json '{"spec": {"is_protected": true}}'
```

Pour plusieurs champs, utilisez un masque de mise à jour dont les valeurs sont séparées par des virgules (par exemple, `spec.autoscaling_limit_min_cu,spec.autoscaling_limit_max_cu`).


## Dépannage \{#troubleshooting\}

Pour les problèmes de configuration Databricks Apps (ressources dans `databricks.yml` et `app.yaml`), [Add a Lakebase resource to a Databricks app](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/lakebase) fournit la référence des ressources et des variables d'environnement. Pour les problèmes de connexion, notamment le réveil après inactivité et le format de l'endpoint, [Troubleshooting in Connect external apps](https://docs.databricks.com/aws/en/oltp/projects/external-apps-connect#troubleshooting) propose des solutions.

- **`permission denied for schema app` (application déployée)** : `npm run dev` a été exécuté avant `databricks apps deploy` ; le schéma appartient donc à vos identifiants personnels et le service principal de l'application ne peut pas y accéder. _(La propriété d'un schéma PostgreSQL est liée au rôle qui l'a créé et ne peut pas être réattribuée par un utilisateur ordinaire.)_ Si vous avez des données à conserver, exportez-les au préalable (`pg_dump` ou copie des tables vers un schéma temporaire). Supprimez ensuite le schéma et redéployez afin que le service principal le recrée au démarrage : `databricks psql --project <project-id> -- -c "DROP SCHEMA IF EXISTS app CASCADE;"` puis `databricks apps deploy`.
- **`permission denied for schema app` (développement local, collaborateur)** : seul le créateur du projet Lakebase obtient automatiquement l'accès `databricks_superuser`. Pour donner un accès local à un coéquipier, le créateur ajoute un rôle correspondant à son identité sur la branch (**Roles & Databases** dans l'interface Lakebase), ou configure l'authentification Postgres par mot de passe. Consultez [About authentication](https://docs.databricks.com/aws/en/oltp/projects/authentication) pour la marche à suivre.
- **`Unknown field path in update_mask: 'spec.suspend_timeout_duration'`** : utilisez `spec.suspension` comme masque de mise à jour pour toutes les modifications de suspension au niveau de l'endpoint effectuées avec `update-endpoint`. Pour désactiver la mise à l'échelle à zéro, transmettez `{"spec": {"no_suspension": true}}`. Pour modifier le délai d'expiration, transmettez `{"spec": {"suspend_timeout_duration": "300s"}}`. La valeur `no_suspension: false` n'est pas prise en charge.
- **Connexion refusée après une période d'inactivité** : l'autoscaling Lakebase descend à zéro en cas d'inactivité. La première connexion qui suit déclenche un réveil et peut subir un bref délai. Si votre bibliothèque de connexion ne réessaie pas automatiquement, ajoutez une courte boucle de nouvelle tentative.

## Documentation AppKit \{#appkit-docs\}

Consultez la référence de l&#39;API AppKit, la documentation des composants et celle des plugins depuis le terminal :

```bash
npx @databricks/appkit docs                    # parcourir l'index de la documentation
npx @databricks/appkit docs "lakebase"         # consulter la documentation du plugin Lakebase Postgres
```

Ou consultez la [référence du plugin AppKit Lakebase Postgres](/docs/appkit/v0/plugins/lakebase) sur ce site.


## Et ensuite \{#where-to-next\}

Les [modèles](/templates) couvrent les cas d'usage courants de Lakebase Postgres. Parcourez-les pour trouver un point de départ, ou copiez-en un dans votre agent de codage pour générer la structure d'une application fonctionnelle.