---
title: Lakeflow Jobs
sidebar_label: Lakeflow Jobs
description: Jobs pluginを使って、AppKitアプリからLakeflow Jobsをトリガーし、監視します。権限、`runNow`と`runAndWait`の使い分け、ポーリングとWebhookの比較。
sourceOfTruth:
  skills:
    - databricks-jobs
  docs:
    - /docs/appkit/v0/plugins/jobs
    - https://docs.databricks.com/aws/en/jobs/
---

# Lakeflow Jobs \{#lakeflow-jobs\}

リクエストハンドラーで処理するには遅すぎる、あるいは重すぎる処理を切り出すには、Lakeflow Jobs を使います。これは、ノートブック、SQL、dbt、Python wheel タスクを実行する Databricks のマネージドランナーです。ユーザー操作をきっかけに実行される典型的な処理としては、モデルの再学習、マルチタスク ETL、長時間におよぶ SQL のバックフィルなどが挙げられます。[Jobs plugin](/docs/appkit/v0/plugins/jobs) は、ハンドラーとジョブを結び付けます。`databricks.yml` でジョブを宣言し、`AppKit.jobs("default").runNow(params)` を呼び出して実行をトリガーするか、`runAndWait` をイテレートして進捗をストリーミングします。

ジョブの作成は workspace 側の作業で、Databricks 上または [Declarative Automation Bundles](https://docs.databricks.com/aws/en/dev-tools/bundles/) を使って行います。AppKit アプリから行うのは、ジョブのトリガーだけです。実行状況のポーリング、SSE（Server-Sent Events）によるストリーミング、Zod によるパラメーター検証は、プラグインが担います。

## 前提条件 \{#prerequisites\}

- [認証済みプロファイル](/docs/tools/databricks-cli#authenticate)を設定した Databricks CLI `v1.0.0+`。
- 実行中の AppKit アプリ。[Apps クイックスタート](/docs/apps/quickstart)を参照してください。
- workspace に定義済みの Lakeflow Jobs。セットアップ方法は [最初のジョブを作成する](https://docs.databricks.com/aws/en/jobs/) を参照してください。

## Jobs plugin を組み込む \{#wire-the-jobs-plugin\}

`createApp` でプラグインを登録します。これにより、ハンドラーから `AppKit.jobs(...)` を利用できるようになり、`app.yaml` でバインドした環境変数からジョブ ID が読み込まれます。

```typescript title="server/server.ts"
import { createApp, jobs, server } from "@databricks/appkit";

await createApp({
  plugins: [server(), jobs()],
});
```

明示的な `jobs` 設定がない場合、プラグインは環境変数 `DATABRICKS_JOB_ID` を読み取り、`default` キーとして登録します。現時点ではデプロイ時に複数の名前付きジョブはサポートされていないため、単一のジョブを `DATABRICKS_JOB_ID` にバインドしてください。


## ジョブをバインドする \{#bind-the-job\}

`databricks.yml` でジョブをリソースとして宣言します。デプロイすると、Apps プラットフォームが service principal に `CAN_MANAGE_RUN` を自動的に付与します。

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

プラグインのデフォルトジョブが参照する環境変数 `DATABRICKS_JOB_ID` として、ジョブ ID を `app.yaml` に設定します。

```yaml title="app.yaml"
env:
  - name: DATABRICKS_JOB_ID
    valueFrom: etl-job
```

リソースの全一覧については [アプリ構成](/docs/apps/configuration#resources) を、環境変数の命名規則については [Jobs plugin リファレンス](/docs/appkit/v0/plugins/jobs) を参照してください。


## ルートハンドラーからトリガーする \{#trigger-from-a-route-handler\}

単発のトリガーには `runNow` を使用します。パラメーターを Zod スキーマでラップしておけば、プラグインが SDK 呼び出しの前に不正な入力を `400` で拒否します。

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

Jobs plugin のすべてのメソッドは [`ExecutionResult<T>`](/docs/appkit/v0/api/appkit/TypeAlias.ExecutionResult) を返します。`result.data` を読み取る前に `result.ok` を確認してください。

ジョブはアプリの **service principal** として実行されます。リソースバインディングによって `CAN_MANAGE_RUN` が付与されるため、ユーザーは個別に権限を付与されなくても実行をトリガーでき、Jobs UI 上では各実行が実際のユーザーではなく service principal による実行として記録されます。AppKit はサインイン中のユーザーの代理でジョブを実行しないため、ユーザーごとのジョブ実行を設定する必要はありません。


## 進行状況をライブでストリーミングする \{#stream-live-progress\}

プラグインは、組み込みの SSE endpoint を `POST /api/jobs/:jobKey/run?stream=true` で公開します。実行が終了するまで、各イベントで `{ status, timestamp, run }` が配信されます。

サーバー側のロジックでは、`runAndWait` を直接反復処理します。これは Promise ではなく非同期イテレーターです:

```typescript
for await (const status of AppKit.jobs("default").runAndWait({
  startDate,
  endDate,
})) {
  // status.status は PENDING、RUNNING、TERMINATED などの順に遷移します
}
```

フック API の全体像とページネーションヘルパーについては、[Jobs pluginリファレンス](/docs/appkit/v0/plugins/jobs)を参照してください。


## 権限 \{#permissions\}

| 権限             | プリンシパルに許可される操作                        |
| ---------------- | --------------------------------------------------- |
| `CAN_VIEW`       | ジョブ定義と実行履歴の参照。                        |
| `CAN_MANAGE_RUN` | 実行のトリガー、実行のキャンセル、実行出力の参照。  |
| `CAN_MANAGE`     | ジョブ定義の変更。AppKit アプリでは使用しません。   |

ジョブのリソースバインディングには `permission: CAN_MANAGE_RUN` を設定します。既存のジョブをトリガーして状態を読み取るだけのアプリであれば、これが最小権限の付与になります。

## ポーリング、Webhook、システムテーブルの使い分け \{#polling-versus-webhooks-versus-system-tables\}

実行時間の長さとUIの要件に応じて、適したパターンを選んでください。

- **プラグイン組み込みの run-and-wait endpoint** は、ユーザーがページで完了を待てる場合に適しています。プラグインが数秒ごと（デフォルト5秒、タイムアウトは最大10分）にSDKをポーリングする間、ブラウザーはSSE接続を保持します。
- **Webhook通知** は、ユーザーがタブを閉じてしまい、後から結果を取得する必要がある場合に適しています。`webhook_notifications.on_success` / `on_failure` の宛先を設定したうえで、実行状態を永続的な場所（アプリで既にLakebaseを使っているなら手軽です）に書き込み、ユーザーが再読み込みしたタイミングで更新をクライアントにストリーミングします。
- **`system.lakeflow.job_run_timeline`** は、service principal に `SELECT` 権限を付与すれば [Analytics plugin](/docs/appkit/v0/plugins/analytics) 経由でクエリできます。実行履歴のダッシュボードやジョブ横断の分析に便利です。

## 次のステップ \{#where-to-next\}

読み取り側については [パイプラインと鮮度](/docs/lakehouse/pipelines) を参照してください。ジョブが投入したデータの横に「最終更新」のタイムスタンプを表示する方法を解説しています。関連する出発点を探す場合は、[テンプレートカタログ](/templates) もあわせてご覧ください。