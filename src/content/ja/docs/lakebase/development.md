---
title: Lakebase Postgres の開発
sidebar_label: 開発
sourceOfTruth:
  skills:
    - databricks-lakebase
    - databricks-dabs
  docs:
    - /docs/appkit/v0/plugins/lakebase
    - https://docs.databricks.com/aws/en/oltp/
---

# Lakebase Postgres 開発 \{#lakebase-postgres-development\}

このページでは、AppKit アプリから Lakebase Postgres を利用して開発する方法を説明します。Lakebase 自体（プロジェクト、branch、autoscaling、接続）については、[Lakebase ドキュメント](https://docs.databricks.com/aws/en/oltp/) または [`databricks-lakebase`](/docs/tools/ai-tools/agent-skills) エージェントスキルを参照してください。

## AppKit プラグイン API \{#appkit-plugin-api\}

`lakebase()` プラグインは、OAuth トークンを自動更新する標準の `pg.Pool` を提供します。登録後は `AppKit.lakebase` からアクセスできます。

```typescript
import { createApp, lakebase, server } from "@databricks/appkit";

const AppKit = await createApp({
  plugins: [server(), lakebase()],
});

// 標準的なパラメーター化クエリ
const { rows } = await AppKit.lakebase.query<{ id: number; name: string }>(
  "SELECT id, name FROM app.items WHERE active = $1",
  [true],
);

// ORM にそのまま渡せる設定（Drizzle、Prisma、TypeORM など）
const ormConfig = AppKit.lakebase.getOrmConfig();
// 戻り値: { host, port, database, ssl, user, ... }

// pg 互換の設定
const pgConfig = AppKit.lakebase.getPgConfig();

// 高度な用途向けの生の pg.Pool
const pool = AppKit.lakebase.pool;
```


### プール構成 \{#pool-configuration\}

`pool` オブジェクトを渡すと、接続プールのデフォルト設定を上書きできます。

```typescript
lakebase({
  pool: {
    max: 10, // 最大接続数（デフォルト: 10）
    connectionTimeoutMillis: 5000, // 接続タイムアウト（ミリ秒、デフォルト: 10000）
    idleTimeoutMillis: 30000, // アイドルタイムアウト（ミリ秒、デフォルト: 30000）
  },
});
```

デフォルトの `max: 10` は、共有サービスプリンシパルプールに適用されます。ユーザーごとの on-behalf-of プール (`asUser(req)` で作成) のデフォルトは `max: 3` です。


### キャッシュ連携 \{#caching-integration\}

Lakebase Postgres は、正常な状態であれば [AppKit キャッシュプラグイン](/docs/appkit/v0/plugins/caching)のバックエンドとしても機能します。API の詳細、ORM 連携、接続設定については、[プラグインリファレンス](/docs/appkit/v0/plugins/lakebase)を参照してください。

## 認証モデル \{#auth-model\}

Lakebase Postgres は、OAuth トークンまたはネイティブの Postgres パスワードを使用してデータベース接続を認証します。どちらの方式を使うかは、アプリの実行場所によって決まります。

**デプロイ済みアプリ**: Databricks App にリソースとして追加すると、Databricks が service principal を自動的に作成し、対応する Postgres ロールを付与したうえで、接続情報を環境変数として注入します。OAuth トークンの更新は、AppKit の `lakebase()` プラグインが自動的に処理します。

**ローカル開発**: 個人の Databricks ID では、`databricks postgres generate-database-credential` で生成した OAuth トークンを使って接続します。トークンは 1 時間で期限切れになりますが、有効期限がチェックされるのはログイン時のみです。確立済みの接続は、トークンの期限切れ後も有効なままです。`npm run dev` を実行する前に、`databricks apps deploy` を少なくとも 1 回実行してください。順序が重要な理由と、権限エラーが発生した場合の対処については [ローカルセットアップ](#local-setup) を参照してください。

Postgres のパスワード認証、トークンのローテーション、マシン間フローについては [About authentication](https://docs.databricks.com/aws/en/oltp/projects/authentication) を参照してください。

## ローカルセットアップ \{#local-setup\}

`databricks apps init` を実行すると、正しい Lakebase Postgres 接続値が `.env` に書き込まれます。`npm run dev` の前に `databricks apps deploy` を実行してください。デプロイするとマネージドアイデンティティ（アプリの service principal）が構成され、初回起動時に `app` スキーマとテーブルを作成し、その所有者になります。先に `npm run dev` を実行してしまうと、これらのオブジェクトが個人の資格情報で作成されるため、デプロイ済みのアプリからはアクセスできず、`permission denied for schema app` が発生します。

### ローカルデータベースアクセス \{#local-database-access\}

Lakebase Postgres プロジェクトを作成した本人であれば、必要なアクセス権はすでに付与されています。`databricks apps deploy` を一度実行すれば、`npm run dev` が動作します。

ローカルでの読み書きアクセスが必要な共同作業者には、Lakebase UI (**Roles &amp; Databases**) で branch のロールを付与してください。Postgres のパスワード認証は OAuth の代替手段です。パスワード接続を有効化し、パスワードロールを作成して、そのパスワードを `.env` の `PGPASSWORD` に指定します。いずれの手順も [About authentication](https://docs.databricks.com/aws/en/oltp/projects/authentication) を参照してください。

任意の PostgreSQL クライアント (DBeaver、pgAdmin、DataGrip、各言語のドライバなど) で使用する短期有効な資格情報を生成することもできます:

```bash
databricks postgres generate-database-credential \
  projects/my-project/branches/production/endpoints/primary
```

スキーマ単位のアクセスが必要なチーム向けに、よりきめ細かな権限設定の選択肢を [AppKit プラグインのドキュメント: ローカル開発](/docs/appkit/v0/plugins/lakebase#local-development) で説明しています。


## psql で接続する \{#connect-with-psql\}

`databricks psql` は、branch の endpoint に対して対話的な PostgreSQL セッションを開きます。事前に `psql` がローカルにインストールされている必要があります。ターゲットを指定しない場合は、アクセス可能なデータベースの中から選択するよう求められます。

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

| オプション             | 説明                                 |
| ----------------- | ---------------------------------- |
| `--autoscaling`   | Lakebase Autoscaling プロジェクトのみを表示   |
| `--project`       | プロジェクト ID                          |
| `--branch`        | branch ID (デフォルト: 自動選択)              |
| `--endpoint`      | endpoint ID (デフォルト: 自動選択)           |
| `--max-retries`   | 接続のリトライ回数。0 で無効化 (デフォルト: 3)        |
| `--debug`         | デバッグログを有効化                         |
| `--output`, `-o`  | 出力形式: text または json (デフォルト: text)  |
| `--profile`, `-p` | ~/.databrickscfg のプロファイル           |
| `--target`, `-t`  | 使用するバンドルターゲット (該当する場合)             |

<!-- /cli-options -->

`--` 区切りの後に指定した引数は、そのまま `psql` に渡されます。例: `databricks psql --project my-project -- -c "SELECT 1"`


## フィーチャーブランチ \{#feature-branches\}

Lakebase Postgres の branch を使用すると、本番環境に影響を与えることなく、スキーマ変更を分離してマイグレーションをテストできます。

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

| オプション                | 説明                                                                   |
| -------------------- | -------------------------------------------------------------------- |
| `--json`             | インラインのJSON文字列、またはリクエストボディを含む@path/to/file.json (デフォルトはJSON (0バイト) )  |
| `--no-wait`          | DONE状態への到達を待機しない                                                     |
| `--replace-existing` | trueの場合、branchが既に存在するときはエラーを返さずに更新する                                 |
| `--timeout`          | DONE状態に到達するまでの最大待機時間                                                 |
| `--debug`            | デバッグログを有効にする                                                         |
| `--output`, `-o`     | 出力形式: textまたはjson (デフォルトはtext)                                       |
| `--profile`, `-p`    | ~/.databrickscfg のプロファイル                                             |
| `--target`, `-t`     | 使用するバンドルターゲット (該当する場合)                                               |

<!-- /cli-options -->

`primary` の読み書き可能なendpointが自動的に作成され、プロジェクトの `default_endpoint_settings` を継承します。branchには有効期限ポリシー (`ttl`、`expire_time`、または `no_expiry: true`) の指定が必須です。利用可能なポリシーの詳細については [ブランチの有効期限](https://docs.databricks.com/aws/en/oltp/projects/manage-branches#expiration) を参照してください。

作業が完了したら削除します:

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

| オプション             | 説明                                         |
| ----------------- | ------------------------------------------ |
| `--no-wait`       | DONE 状態になるまで待機しない                          |
| `--purge`         | true の場合は branch を完全に削除し、false の場合は論理削除する。 |
| `--timeout`       | DONE 状態になるまでの最大待機時間                        |
| `--debug`         | デバッグログを有効にする                               |
| `--output`, `-o`  | 出力形式: text または json (デフォルトは text)          |
| `--profile`, `-p` | ~/.databrickscfg のプロファイル                   |
| `--target`, `-t`  | 使用するバンドルターゲット (該当する場合)                     |

<!-- /cli-options -->


## プラットフォーム外のアプリ \{#off-platform-apps\}

Databricks の外部でホストするアプリ (AWS、Vercel、Netlify など) の場合、プラットフォームが接続情報を自動で挿入したり、OAuth トークンを自動更新したりすることはありません。トークンのローテーションはアプリ側の責任です。トークンのローテーションとマシン間 (machine-to-machine) のパターンについては、[Lakebase の認証について](https://docs.databricks.com/aws/en/oltp/projects/authentication) を参照してください。[Lakebase Off-Platform](/templates/lakebase-off-platform) テンプレートには、環境設定と Drizzle ORM 統合を含む完全な実装が用意されています。

テンプレートを使わずにプロビジョニングして接続するには、プロジェクトを作成し、その endpoint とデータベースを読み取ったうえで接続します。

```bash
databricks postgres create-project <project-id>
databricks postgres list-endpoints projects/<project-id>/branches/production -o json
databricks postgres list-databases projects/<project-id>/branches/production -o json
databricks psql --project <project-id>
```

`create-project` は、デフォルトの `production` branch、`databricks_postgres` データベース、読み書き可能な endpoint を備えたプロジェクトを作成します。`psql` がない場合は、`databricks postgres generate-database-credential <endpoint-path>` を実行し、返されたトークンをパスワードとして (ユーザー名は Databricks のメールアドレス) 任意の PostgreSQL クライアントで使用してください。一連の手順とフラグの詳細については、[Lakebase ドキュメント](https://docs.databricks.com/aws/en/oltp/) または [`databricks-lakebase`](/docs/tools/ai-tools/agent-skills) エージェントスキルを参照してください。

`list-endpoints` と `list-databases` の出力から必要になる値は次のとおりです。

| 値                  | JSON パス                     | 用途                           |
| ------------------ | --------------------------- | ---------------------------- |
| endpointホスト         | `status.hosts.host`         | `PGHOST`                     |
| endpointリソースパス      | `name`                      | `LAKEBASE_ENDPOINT`          |
| データベースリソースパス       | `name` (list-databases から)  | `lakebase.postgres.database` |
| PostgreSQL データベース名 | `status.postgres_database`  | `PGDATABASE`                 |


## 長時間実行される操作 \{#long-running-operations\}

作成、更新、削除の各コマンドは、デフォルトでは処理が完了するまでブロックします。すぐに制御を戻してステータスをポーリングする場合は、`--no-wait` を使用します。

```bash
databricks postgres create-project my-project \
  --json '{"spec": {"display_name": "My Project"}}' \
  --no-wait

databricks postgres get-operation projects/my-project/operations/<operation-id>
```


## Declarative Automation Bundles \{#declarative-automation-bundles\}

Declarative Automation Bundles (DABs) を使うと、Lakebase Postgres のインフラストラクチャを `databricks.yml` にコードとして定義し、アプリケーションと一緒にバージョン管理できます。バンドルでは、`resources` 配下に `postgres_projects`、`postgres_branches`、`postgres_endpoints` を指定します。

<details>
<summary>プロジェクト、dev branch、読み取り専用レプリカを含む <code>databricks.yml</code> の例</summary>

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


### 検証とデプロイ \{#validate-and-deploy\}

```bash
databricks bundle validate
databricks bundle deploy
```

`bundle deploy` はべき等です。新しいリソースを作成し、既存のリソースは設定内容に合わせて更新します。Databricks Jobs や Apps とは異なり、`bundle run` に相当するステップはありません。Lakebase Postgres のリソースはデプロイした時点で有効になります。すべてのオプションについては [Declarative Automation Bundles のドキュメント](https://docs.databricks.com/aws/en/dev-tools/bundles/) を参照してください。また、[`databricks-dabs`](/docs/tools/ai-tools/agent-skills) エージェントスキルを使えば、バンドルの作成と検証が行えます。


## 更新マスク \{#update-masks\}

更新コマンドでは、変更対象のフィールドを指定する更新マスクが必要です。新しい値は `--json` ペイロードで渡します。変更されるのは、マスクで指定したフィールドのみです。

```bash
databricks postgres update-branch \
  projects/my-project/branches/production \
  spec.is_protected \
  --json '{"spec": {"is_protected": true}}'
```

複数のフィールドを指定する場合は、カンマ区切りの更新マスクを使用します (例: `spec.autoscaling_limit_min_cu,spec.autoscaling_limit_max_cu`) 。


## トラブルシューティング \{#troubleshooting\}

Databricks Apps の構成に関する問題（`databricks.yml` と `app.yaml` のリソース）については、[Add a Lakebase resource to a Databricks app](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/lakebase) にリソースと環境変数のリファレンスがあります。アイドル状態からの復帰や endpoint の形式など、接続に関する問題については、[Troubleshooting in Connect external apps](https://docs.databricks.com/aws/en/oltp/projects/external-apps-connect#troubleshooting) に対処方法があります。

- **`permission denied for schema app`（デプロイ済みアプリ）**: `databricks apps deploy` より前に `npm run dev` を実行したため、スキーマの所有者が個人の資格情報となり、アプリの service principal からアクセスできません。_（PostgreSQL のスキーマ所有権は作成したロールに紐付いており、一般ユーザーが付け替えることはできません。）_ 残しておきたいデータがある場合は、削除する前にエクスポート（`pg_dump`、または一時スキーマへのテーブルのコピー）してください。その後、スキーマを削除して再デプロイすれば、起動時に SP が再作成します。`databricks psql --project <project-id> -- -c "DROP SCHEMA IF EXISTS app CASCADE;"` を実行し、続いて `databricks apps deploy` を実行します。
- **`permission denied for schema app`（ローカル開発、共同作業者）**: `databricks_superuser` アクセスが自動的に付与されるのは Lakebase プロジェクトの作成者のみです。チームメンバーにローカルアクセスを許可するには、作成者が branch 上でそのアイデンティティ用のロールを追加する（Lakebase UI の **Roles & Databases**）か、Postgres のパスワード認証を設定します。手順は [About authentication](https://docs.databricks.com/aws/en/oltp/projects/authentication) を参照してください。
- **`Unknown field path in update_mask: 'spec.suspend_timeout_duration'`**: `update-endpoint` で endpoint レベルのサスペンド設定を変更する場合は、update mask として `spec.suspension` を使用します。スケール・トゥ・ゼロを無効にするには `{"spec": {"no_suspension": true}}` を渡します。タイムアウトを変更するには `{"spec": {"suspend_timeout_duration": "300s"}}` を渡します。`no_suspension: false` の設定はサポートされていません。
- **一定時間アクセスがないと接続が拒否される**: Lakebase の autoscaling はアイドル時にゼロへスケールします。アイドル後の最初の接続では復帰処理が走るため、わずかに遅延することがあります。使用している接続ライブラリが自動で再試行しない場合は、短い再試行ループを追加してください。

## AppKit ドキュメント \{#appkit-docs\}

AppKit の API リファレンス、コンポーネントドキュメント、プラグインドキュメントには、ターミナルからアクセスできます。

```bash
npx @databricks/appkit docs                    # ドキュメントの一覧を表示
npx @databricks/appkit docs "lakebase"         # Lakebase Postgres プラグインのドキュメントを表示
```

または、本サイト内の [AppKit Lakebase Postgres プラグインリファレンス](/docs/appkit/v0/plugins/lakebase) を参照してください。


## 次のステップ \{#where-to-next\}

[テンプレート](/templates)には、Lakebase Postgres でよく使われるパターンがまとまっています。一覧から出発点となるものを探すか、コーディングエージェントに貼り付けて動作するアプリの雛形を生成してください。