---
title: Lakeflow Jobs
sidebar_label: Lakeflow Jobs
description: Acione e monitore Lakeflow Jobs a partir do seu app AppKit com o plugin Jobs. Permissões, `runNow` versus `runAndWait`, polling versus webhooks.
sourceOfTruth:
  skills:
    - databricks-jobs
  docs:
    - /docs/appkit/v0/plugins/jobs
    - https://docs.databricks.com/aws/en/jobs/
---

# Lakeflow Jobs \{#lakeflow-jobs\}

Para delegar trabalhos lentos ou pesados demais para um handler de requisição, você precisa de um Lakeflow Job, o executor gerenciado da Databricks para notebooks, SQL, dbt e tarefas de Python wheel. Exemplos típicos de trabalho disparado por uma ação do usuário: retreinamento de modelos, ETL multitarefa ou um backfill SQL demorado. O [plugin Jobs](/pt/docs/appkit/v0/plugins/jobs) conecta seu handler a um job: declare-o em `databricks.yml` e depois chame `AppKit.jobs("default").runNow(params)` para disparar uma execução ou itere sobre `runAndWait` para acompanhar o progresso em streaming.

A criação de jobs é uma tarefa de workspace, feita no Databricks ou com [Declarative Automation Bundles](https://docs.databricks.com/aws/en/dev-tools/bundles/). A partir de um app AppKit, você apenas os dispara. O plugin cuida do polling das execuções, do streaming via SSE (Server-Sent Events) e da validação de parâmetros com Zod.

## Pré-requisitos \{#prerequisites\}

* Databricks CLI `v1.0.0+` com um [perfil autenticado](/pt/docs/tools/databricks-cli#authenticate).
* Um app AppKit em execução. Consulte o [Início rápido de Apps](/pt/docs/apps/quickstart).
* Um Lakeflow Job definido no seu workspace. Consulte [Create your first job](https://docs.databricks.com/aws/en/jobs/) para saber como configurá-lo.

## Integrar o plugin Jobs \{#wire-the-jobs-plugin\}

Registre o plugin em `createApp`. Ele expõe `AppKit.jobs(...)` para os seus handlers e lê os IDs dos jobs a partir das variáveis de ambiente que você define no `app.yaml`.

```typescript title="server/server.ts"
import { createApp, jobs, server } from "@databricks/appkit";

await createApp({
  plugins: [server(), jobs()],
});
```

Sem uma configuração `jobs` explícita, o plugin lê `DATABRICKS_JOB_ID` do ambiente e o registra sob a chave `default`. No momento, não há suporte a múltiplos jobs nomeados durante o deploy, portanto vincule um único job a `DATABRICKS_JOB_ID`.

## Vincular o job \{#bind-the-job\}

Declare o job como um recurso no `databricks.yml`. A plataforma de Apps concede automaticamente a permissão `CAN_MANAGE_RUN` ao seu service principal no momento do deploy:

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

Injete o ID do job no `app.yaml` como `DATABRICKS_JOB_ID`, a variável de ambiente que o job padrão do plugin lê:

```yaml title="app.yaml"
env:
  - name: DATABRICKS_JOB_ID
    valueFrom: etl-job
```

Consulte [Configuração do app](/pt/docs/apps/configuration#resources) para ver a lista completa de recursos e a [referência do plugin Jobs](/pt/docs/appkit/v0/plugins/jobs) para as regras de nomenclatura das variáveis de ambiente.

## Acionar a partir de um manipulador de rota \{#trigger-from-a-route-handler\}

Use `runNow` para um acionamento único. Encapsule os parâmetros em um esquema Zod e o plugin rejeitará entradas inválidas com um `400` antes da chamada ao SDK.

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

Todos os métodos do plugin Jobs retornam [`ExecutionResult<T>`](/pt/docs/appkit/v0/api/appkit/TypeAlias.ExecutionResult). Verifique `result.ok` antes de ler `result.data`.

Os jobs são executados como o **service principal** do app. A vinculação de recurso concede a ele `CAN_MANAGE_RUN`, de modo que os usuários disparam execuções sem precisar de permissões individuais, e a interface de Jobs atribui cada execução ao service principal, e não ao usuário humano. O AppKit não executa jobs em nome do usuário autenticado, portanto não há execução de job por usuário para configurar.

## Transmita o progresso em tempo real \{#stream-live-progress\}

O plugin expõe um endpoint SSE integrado em `POST /api/jobs/:jobKey/run?stream=true`. Cada evento envia `{ status, timestamp, run }` até que a execução termine.

Na lógica do servidor, itere diretamente sobre `runAndWait`. Ele é um iterador assíncrono, não uma promise:

```typescript
for await (const status of AppKit.jobs("default").runAndWait({
  startDate,
  endDate,
})) {
  // status.status passa por PENDING, RUNNING, TERMINATED, etc.
}
```

A API completa do hook e os utilitários de paginação estão documentados na [referência do plugin Jobs](/pt/docs/appkit/v0/plugins/jobs).

## Permissões \{#permissions\}

| Permissão        | O que permite ao seu principal                               |
| ---------------- | ------------------------------------------------------------ |
| `CAN_VIEW`       | Ler a definição do job e o histórico de execuções.            |
| `CAN_MANAGE_RUN` | Disparar execuções, cancelá-las e ver a saída delas.          |
| `CAN_MANAGE`     | Modificar a definição do job. Não usado por apps do AppKit.   |

Defina `permission: CAN_MANAGE_RUN` na vinculação de recurso de job. Essa é a concessão de menor privilégio para um app que apenas dispara jobs existentes e consulta o estado deles.

## Polling, webhooks ou tabelas de sistema \{#polling-versus-webhooks-versus-system-tables\}

Escolha o padrão que melhor se adequa à duração da execução e à sua interface:

* **O endpoint integrado de executar e aguardar do plugin** funciona bem quando o usuário está disposto a esperar na página. O navegador mantém uma conexão SSE enquanto o plugin consulta o SDK a cada poucos segundos (5s por padrão, com tempo limite de até 10 minutos).
* **Notificações por webhook** são a melhor opção quando o usuário fecha a aba e você precisa do resultado mais tarde. Configure os destinos `webhook_notifications.on_success` / `on_failure`, grave o estado da execução em algum local durável (o Lakebase é conveniente se o seu app já o utiliza) e transmita as atualizações ao cliente quando ele recarregar a página.
* **`system.lakeflow.job_run_timeline`** pode ser consultada pelo [Analytics plugin](/pt/docs/appkit/v0/plugins/analytics) assim que o seu service principal tiver `SELECT` sobre ela. Útil para painéis de histórico de execuções ou análises entre jobs.

## Próximos passos \{#where-to-next\}

Consulte [Pipelines e atualidade dos dados](/pt/docs/lakehouse/pipelines) para ver o lado da leitura: como exibir o carimbo de &quot;última atualização&quot; ao lado dos dados preenchidos por um job. Ou explore o [catálogo de templates](/pt/templates) em busca de pontos de partida relacionados.