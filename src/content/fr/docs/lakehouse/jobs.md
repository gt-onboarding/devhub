---
title: Lakeflow Jobs
sidebar_label: Lakeflow Jobs
description: Déclenchez et surveillez des Lakeflow Jobs depuis votre application AppKit grâce au plugin Jobs. Autorisations, `runNow` ou `runAndWait`, interrogation périodique ou webhooks.
sourceOfTruth:
  skills:
    - databricks-jobs
  docs:
    - /docs/appkit/v0/plugins/jobs
    - https://docs.databricks.com/aws/en/jobs/
---

# Lakeflow Jobs \{#lakeflow-jobs\}

Pour déporter un traitement trop lent ou trop lourd pour un gestionnaire de requêtes, vous avez besoin d&#39;un Lakeflow Job, le moteur d&#39;exécution géré de Databricks pour les tâches notebook, SQL, dbt et wheel Python. Exemples typiques de traitements déclenchés par une action utilisateur : réentraînement de modèle, ETL multitâche ou backfill SQL de longue durée. Le [plugin Jobs](/fr/docs/appkit/v0/plugins/jobs) relie votre gestionnaire à un job : déclarez-le dans `databricks.yml`, puis appelez `AppKit.jobs("default").runNow(params)` pour déclencher une exécution, ou itérez sur `runAndWait` pour suivre la progression en streaming.

La création des jobs se fait côté workspace, dans Databricks ou avec les [Declarative Automation Bundles](https://docs.databricks.com/aws/en/dev-tools/bundles/). Depuis une app AppKit, vous vous contentez de les déclencher. Le plugin prend en charge l&#39;interrogation périodique des exécutions, le streaming SSE (Server-Sent Events) et la validation des paramètres avec Zod.

## Prérequis \{#prerequisites\}

* Databricks CLI `v1.0.0+` avec un [profil authentifié](/fr/docs/tools/databricks-cli#authenticate).
* Une application AppKit en cours d&#39;exécution. Consultez le [Démarrage rapide des apps](/fr/docs/apps/quickstart).
* Un Lakeflow Job défini dans votre workspace. Consultez [Create your first job](https://docs.databricks.com/aws/en/jobs/) pour la procédure de configuration.

## Brancher le plugin Jobs \{#wire-the-jobs-plugin\}

Enregistrez le plugin dans `createApp`. Il expose `AppKit.jobs(...)` à vos gestionnaires et lit les identifiants de jobs à partir des variables d&#39;environnement que vous déclarez dans `app.yaml`.

```typescript title="server/server.ts"
import { createApp, jobs, server } from "@databricks/appkit";

await createApp({
  plugins: [server(), jobs()],
});
```

En l&#39;absence de configuration `jobs` explicite, le plugin lit `DATABRICKS_JOB_ID` depuis l&#39;environnement et l&#39;enregistre sous la clé `default`. La déclaration de plusieurs jobs nommés n&#39;est pas encore prise en charge au moment du déploiement : associez donc un seul job à `DATABRICKS_JOB_ID`.

## Lier le job \{#bind-the-job\}

Déclarez le job comme ressource dans `databricks.yml`. Lors du déploiement, la plateforme Apps accorde automatiquement l&#39;autorisation `CAN_MANAGE_RUN` à votre service principal :

```yaml title="databricks.yml"
resources:
  apps:
    my-app:
      resources:
        - name: etl-job
          job:
            id: ${var.etl_job_id}
            permission: CAN_MANAGE_RUN
```

Injectez l&#39;ID du job dans `app.yaml` sous le nom `DATABRICKS_JOB_ID`, la variable d&#39;environnement que lit le job par défaut du plugin :

```yaml title="app.yaml"
env:
  - name: DATABRICKS_JOB_ID
    valueFrom: etl-job
```

Consultez [Configuration de l&#39;application](/fr/docs/apps/configuration#resources) pour la liste complète des ressources et la [référence du plugin Jobs](/fr/docs/appkit/v0/plugins/jobs) pour les règles de nommage des variables d&#39;environnement.

## Déclencher depuis un gestionnaire de route \{#trigger-from-a-route-handler\}

Utilisez `runNow` pour un déclenchement ponctuel. Encapsulez les paramètres dans un schéma Zod : le plugin rejette alors les entrées invalides avec un `400`, avant même l&#39;appel au SDK.

```typescript title="server/server.ts"
import { createApp, jobs, server } from "@databricks/appkit";
import { z } from "zod";

const AppKit = await createApp({
  plugins: [
    server(),
    jobs({
      jobs: {
        default: {
          taskType: "notebook",
          params: z.object({
            startDate: z.string(),
            endDate: z.string(),
          }),
        },
      },
    }),
  ],
});

AppKit.server.extend((app) => {
  app.post("/api/etl/run", async (req, res) => {
    const result = await AppKit.jobs("default").runNow({
      startDate: req.body.startDate,
      endDate: req.body.endDate,
    });
    if (!result.ok) return res.status(500).json({ error: result.error });
    res.json({ runId: result.data.run_id });
  });
});
```

Toutes les méthodes du plugin Jobs renvoient [`ExecutionResult<T>`](/fr/docs/appkit/v0/api/appkit/TypeAlias.ExecutionResult). Vérifiez `result.ok` avant de lire `result.data`.

Les jobs s&#39;exécutent sous l&#39;identité du **service principal** de l&#39;application. Le resource binding lui accorde `CAN_MANAGE_RUN` : les utilisateurs peuvent ainsi déclencher des exécutions sans grants individuels, et l&#39;interface Jobs attribue chaque exécution au service principal plutôt qu&#39;à l&#39;utilisateur humain. AppKit n&#39;exécute pas de jobs pour le compte de l&#39;utilisateur connecté : il n&#39;y a donc aucune exécution de job par utilisateur à configurer.

## Diffuser la progression en direct \{#stream-live-progress\}

Le plugin expose un endpoint SSE intégré sur `POST /api/jobs/:jobKey/run?stream=true`. Chaque événement transmet `{ status, timestamp, run }` jusqu&#39;à la fin de l&#39;exécution.

Côté serveur, itérez directement sur `runAndWait`. Il s&#39;agit d&#39;un itérateur asynchrone, et non d&#39;une promesse :

```typescript
for await (const status of AppKit.jobs("default").runAndWait({
  startDate,
  endDate,
})) {
  // status.status passe successivement par PENDING, RUNNING, TERMINATED, etc.
}
```

L&#39;API complète du hook et les utilitaires de pagination sont décrits dans la [référence du plugin Jobs](/fr/docs/appkit/v0/plugins/jobs).

## Autorisations \{#permissions\}

| Autorisation     | Ce que votre principal peut faire                                      |
| ---------------- | ---------------------------------------------------------------------- |
| `CAN_VIEW`       | Lire la définition du job et l&#39;historique des exécutions.              |
| `CAN_MANAGE_RUN` | Déclencher des exécutions, les annuler, consulter leur sortie.         |
| `CAN_MANAGE`     | Modifier la définition du job. Non utilisé par les applications AppKit. |

Définissez `permission: CAN_MANAGE_RUN` sur le resource binding du job. C&#39;est le privilège minimal requis pour une application qui se contente de déclencher des jobs existants et de lire leur état.

## Polling, webhooks ou tables système \{#polling-versus-webhooks-versus-system-tables\}

Choisissez le modèle adapté à la durée d&#39;exécution et à votre interface :

* **L&#39;endpoint intégré du plugin qui lance l&#39;exécution et attend son issue** convient lorsque l&#39;utilisateur accepte de patienter sur la page. Le navigateur maintient une connexion SSE pendant que le plugin interroge le SDK toutes les quelques secondes (5 s par défaut, avec un délai d&#39;expiration de 10 minutes).
* **Les notifications par webhook** conviennent lorsque l&#39;utilisateur ferme l&#39;onglet et que le résultat ne vous est utile que plus tard. Configurez les destinations `webhook_notifications.on_success` / `on_failure`, écrivez l&#39;état de l&#39;exécution dans un stockage durable (Lakebase est pratique si votre application l&#39;utilise déjà), puis diffusez les mises à jour vers le client au rechargement de la page.
* **`system.lakeflow.job_run_timeline`** est interrogeable via l&#39;[Analytics plugin](/fr/docs/appkit/v0/plugins/analytics) dès lors que votre service principal dispose du privilège `SELECT` sur cette table. Utile pour les tableaux de bord d&#39;historique d&#39;exécutions ou les analyses inter-jobs.

## Et ensuite \{#where-to-next\}

Consultez [Pipelines and freshness](/fr/docs/lakehouse/pipelines) pour le volet lecture : l&#39;affichage des horodatages « dernière mise à jour » à côté des données alimentées par un job. Vous pouvez aussi parcourir le [catalogue de modèles](/fr/templates) pour découvrir d&#39;autres points de départ.