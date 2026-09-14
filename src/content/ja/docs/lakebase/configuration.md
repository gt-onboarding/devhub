---
title: Lakebase Postgres の設定
sidebar_label: 構成
sourceOfTruth:
  skills:
    - databricks-lakebase
  docs:
    - /docs/appkit/v0/plugins/lakebase
    - https://docs.databricks.com/aws/en/oltp/projects/manage-projects
---

# Lakebase Postgres の設定 \{#lakebase-postgres-configuration\}

AppKit は、`databricks.yml` で宣言した `postgres` リソースと、`app.yaml` で設定した `LAKEBASE_ENDPOINT` を使って Lakebase Postgres に接続します。

このページでは、AppKit 側の接続設定について説明します。Lakebase 自体（プロジェクト、branch、autoscaling、ゼロへのスケール）については、[Lakebase のドキュメント](https://docs.databricks.com/aws/en/oltp/) または [`databricks-lakebase`](/docs/tools/ai-tools/agent-skills) エージェントスキルを参照してください。

## 接続値 \{#connection-values\}

Databricks Apps は、ほとんどの接続値を起動時に注入します。唯一の例外が `LAKEBASE_ENDPOINT` です。この値は `app.yaml` で `valueFrom: postgres` として宣言し、起動時に `postgres` リソースから解決されます。

```yaml
env:
  - name: LAKEBASE_ENDPOINT
    valueFrom: postgres
```

| 変数                  | 説明                                                            | 取得元                                    |
| ------------------- | ------------------------------------------------------------- | -------------------------------------- |
| `LAKEBASE_ENDPOINT` | endpoint のリソースパス (`projects/.../branches/.../endpoints/...`)  | `app.yaml` の `valueFrom: postgres` で設定 |
| `PGHOST`            | Lakebase Postgres のホスト                                        | プラットフォームが自動的に注入                        |
| `PGDATABASE`        | PostgreSQL のデータベース名                                           | プラットフォームが自動的に注入                        |
| `PGSSLMODE`         | TLS モード (`require`)                                           | プラットフォームが自動的に注入                        |
| `PGPORT`            | ポート (5432)                                                    | プラットフォームが自動的に注入                        |

ローカル開発では、これらの値は `.env` ファイルから読み込まれます。設定方法は [ローカルセットアップ](/docs/lakebase/development#local-setup) を参照してください。


## プラグインマニフェスト \{#plugin-manifest\}

`createApp` で `lakebase()` プラグインを登録すると、AppKit はプラグインが必要とするリソースを宣言した `appkit.plugins.json` を生成します。プラグインを追加または変更した後は、`npx @databricks/appkit plugin sync --write` を実行して再生成してください。

```bash
npx @databricks/appkit plugin sync --write
```

これは `npm run dev` と `npm run build` の実行時に自動生成されます。生成されたファイルはコードと一緒にコミットしてください。

`app.yaml` でのプラグインリソースバインディングについては、[AppKit 設定](/docs/appkit/v0/configuration)リファレンスで詳しく説明しています。


## リソース階層 \{#resource-hierarchy\}

Lakebase Postgres のリソースは、**branch** を含む **project** という階層で構成され、branch はさらに **compute** と **database** を含みます。

```text
projects/{project_id}
  └── branches/{branch_id}
        ├── endpoints/{endpoint_id}   (compute)
        └── databases/{database_id}
```

* **プロジェクト**: 最上位のコンテナ。`databricks postgres create-project` で作成します。
* **branch**: 分離されたデータベース環境。新規プロジェクトには、`databricks_postgres` データベースを含むデフォルトの `production` branch が作成されます。
* **compute**: branch に処理能力とメモリを提供します。各 branch には `primary` の読み書き compute が自動的に作成されます。読み取り性能をスケールさせたい場合は、読み取り専用レプリカを追加できます。
* **データベース**: branch 内の PostgreSQL データベース。`databricks postgres list-databases <branch>` で一覧表示します。

CLI と API では、compute を **endpoint** と呼びます (読み書きは `ENDPOINT_TYPE_READ_WRITE`、読み取りレプリカは `ENDPOINT_TYPE_READ_ONLY`) 。本ドキュメントのコマンドとリソースパスでもこの用語を使用します。

すべての `databricks postgres` コマンドについては、[`postgres` CLI リファレンス](https://docs.databricks.com/aws/en/oltp/projects/cli) を参照してください。


## branching \{#branching\}

branchにより、分離されたデータベース環境を作成できます。branchを作成すると、Lakebase Postgres はコピーオンライトでソースbranchのスキーマとデータをコピーします。新しいbranchは即座に作成され、変更したデータ分のみ課金されます。

新しいbranchにはそれぞれ、`projects/{project_id}/branches/{branch_id}/endpoints/primary` に読み書き可能な `primary` endpointが作成され、プロジェクトの `default_endpoint_settings` を継承します。読み取り専用レプリカ（`ENDPOINT_TYPE_READ_ONLY`）を追加するには `create-endpoint` を使用します。

branchには有効期限ポリシー（`ttl`、`expire_time`、または `no_expiry: true`）が必要です。すべてのオプションの詳細は [Branch expiration](https://docs.databricks.com/aws/en/oltp/projects/manage-branches#expiration) を参照してください。CLI コマンドの例は [フィーチャーブランチ](/docs/lakebase/development#feature-branches) にあります。

:::note
プロジェクト、branch、endpoint、データベースの ID は 1〜63 文字で、小文字で始まり、小文字・数字・ハイフンのみを使用する必要があります。
:::

## Autoscaling \{#autoscaling\}

computeは、設定した最小および最大のコンピュートユニット (CU) の範囲内で自動的にスケールします。範囲はプロジェクト単位またはendpoint単位で設定します。デフォルトのCU値、最大コンピュートサイズ、最小/最大の制約はLakebaseの設定であり、随時変更されるため、最新の値は[Autoscaling](https://docs.databricks.com/aws/en/oltp/projects/autoscaling)で確認してください。

設定した範囲内でのスケーリングは、接続を中断することなく行われます。最小値または最大値を変更した場合は、短時間の中断が発生することがあります。

<details>
<summary>autoscalingを設定する</summary>

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

| オプション             | 説明                                                                          |
| ----------------- | --------------------------------------------------------------------------- |
| `--json`          | インライン JSON 文字列、またはリクエストボディを記述した @path/to/file.json (デフォルトは JSON (0 bytes))  |
| `--no-wait`       | DONE 状態になるまで待機しない                                                           |
| `--timeout`       | DONE 状態に達するまでの最大待機時間                                                        |
| `--debug`         | デバッグログを有効化                                                                  |
| `--output`, `-o`  | 出力形式: text または json (デフォルトは text)                                           |
| `--profile`, `-p` | ~/.databrickscfg のプロファイル                                                    |
| `--target`, `-t`  | 使用するバンドルターゲット (該当する場合)                                                      |

<!-- /cli-options -->

</details>


## ゼロへのスケール \{#scale-to-zero\}

[ゼロへのスケール](https://docs.databricks.com/aws/en/oltp/projects/scale-to-zero)は、アイドル状態のcomputeを一時停止してコストを削減する機能です。新しいクエリを受け取ると、computeは自動的に再開します (通常は数百ミリ秒) 。

デフォルトのタイムアウトは24時間で、60秒から7日までの任意の値を設定できます。開発用のbranchでは、タイムアウトを短く (たとえば30分に) することでコストをさらに抑えられます。スケールダウンしたcomputeに接続するアプリでは、最初のクエリでわずかな待ち時間が発生します。アプリ側には接続のリトライ処理を実装してください。

computeが再開すると、セッションコンテキスト (一時テーブル、プリペアドステートメント、セッション設定、コネクションプール) はリセットされます。

<details>
<summary>ゼロへのスケールを設定する</summary>

以下の `300s` はカスタムタイムアウトの記述例であり、デフォルト値ではありません (デフォルトは24時間) 。60秒から7日までの任意の値を設定できます。

**プロジェクトのデフォルト** (新しいbranchはこれらの設定を継承します) :

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

| オプション             | 説明                                                                     |
| ----------------- | ---------------------------------------------------------------------- |
| `--json`          | インラインのJSON文字列、またはリクエストボディを含む@path/to/file.json (デフォルトはJSON (0 bytes))  |
| `--no-wait`       | DONE状態への到達を待機しない                                                       |
| `--timeout`       | DONE状態に到達するまでの最大待機時間                                                   |
| `--debug`         | デバッグログを有効化                                                             |
| `--output`, `-o`  | 出力形式：textまたはjson (デフォルトはtext)                                          |
| `--profile`, `-p` | ~/.databrickscfg のプロファイル                                               |
| `--target`, `-t`  | 使用するバンドルターゲット (該当する場合)                                                 |

<!-- /cli-options -->

**endpoint単位** (既存のendpointで変更または無効化する場合) :

`update-endpoint` でサスペンション設定を変更する場合は、いずれの場合も更新マスクに `spec.suspension` を指定します。

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
`no_suspension: false` の設定はサポートされておらず、エラーが返されます。ゼロへのスケールを無効化した後に再度有効化する場合は、代わりに `suspend_timeout_duration` を設定してください。
:::

</details>


## 次のステップ \{#where-to-next\}

ローカル環境のセットアップ、フィーチャーブランチ、プラグイン API の詳細については [Lakebase Postgres 開発](/docs/lakebase/development) を参照してください。実装パターンの全体像を確認するには [テンプレートカタログ](/templates) をご覧ください。