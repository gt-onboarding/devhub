---
title: アプリの設定
sidebar_label: 設定
sourceOfTruth:
  skills:
    - databricks-apps
  docs:
    - /docs/appkit/v0/configuration
    - https://docs.databricks.com/aws/en/dev-tools/databricks-apps/
---

# 設定 \{#app-configuration\}

AppKit アプリの起動方法と接続先は、2 つのファイルで制御します。`app.yaml` (ランタイムの動作と環境変数) と `databricks.yml` (Databricks リソース) です。各アプリには作成時に固定の URL が割り当てられ、後から変更することはできません。

:::tip[Python で開発する場合]

AppKit は Node.js 上の TypeScript を対象としています。Python でのアプリ開発は本サイトでは扱いません。Python フレームワーク (Gradio、Streamlit、Dash) については [Databricks Apps のドキュメント](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/)を参照してください。

:::

## 設定ファイル \{#configuration-files\}

**`app.yaml`** は、実行時の動作 (起動コマンドと環境変数) を制御します。

```yaml
command: ["npm", "run", "start"]
env:
  - name: LAKEBASE_ENDPOINT
    valueFrom: postgres
  - name: WAREHOUSE_ID
    valueFrom: sql-warehouse
```

`command` はシェル文字列ではなくシーケンス (配列) です。`command` 内では `DATABRICKS_APP_PORT` を除き、環境変数の展開はサポートされません。

**`databricks.yml`** は、Databricks のリソース、変数、デプロイターゲットを宣言します。

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

`${var.postgres_branch}` などの変数は、`databricks.yml` の `variables` セクション、またはデプロイ時に指定する CLI フラグから解決されます。

プラグインのリソースバインディングを含む、AppKit 固有の `app.yaml` の完全なリファレンスについては、[AppKit の設定](/ja/docs/appkit/v0/configuration)を参照してください。

## プラグインマニフェスト \{#plugin-manifest\}

各 AppKit アプリには `appkit.plugins.json` があり、有効なプラグインと、それらが必要とする Databricks リソースを宣言します。このファイルは次のコマンドを実行すると自動生成されます。

```bash
npx @databricks/appkit plugin sync --write
```

これは `npm run dev` と `npm run build` の実行時に自動生成されます。コードと一緒にコミットしてください。CLI とデプロイパイプラインは、これを使用してリソースをプロビジョニングします。

## リソース \{#resources\}

アプリは、宣言したリソースを介して Databricks サービスにアクセスします。各リソースは `databricks.yml` で `name` を持ち、その名前を `app.yaml` の `valueFrom` の値に指定します。

AppKit テンプレートでは、プラグインが管理するリソースに慣例的な名前を使用します。

| リソース                                                                      | リソース名      | 提供内容              |
| ----------------------------------------------------------------------------- | ------------------ | ----------------------------- |
| [Lakebase Postgres](/ja/docs/lakebase/quickstart)                                | `postgres`         | PostgreSQL 接続         |
| [SQL Warehouse](https://docs.databricks.com/aws/en/compute/sql-warehouse/)    | `sql-warehouse`    | SQL クエリの実行           |
| [Model Serving](/ja/docs/agents/ai-gateway)                                      | `serving-endpoint` | AI モデルの推論            |
| [Genie Agent](/ja/docs/agents/genie)                                             | `genie-space`      | 自然言語によるデータクエリ |
| [Job](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/resources) | `job`              | スケジュール実行またはトリガー実行のジョブ    |
| [UC Volumes](https://docs.databricks.com/aws/en/files/)                       | `volume`           | ファイルストレージ                  |

その他のリソースタイプ (Unity Catalog テーブル、接続、AI Search インデックス (旧 Vector Search) 、MLflow エクスペリメントなど) については、[公式のリソースドキュメント](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/resources)を参照してください。

### シークレット \{#secrets\}

どちらの設定ファイルにもシークレットの値は含まれません。`databricks.yml` では、自分で定義した[シークレットスコープ](https://docs.databricks.com/aws/en/security/secrets)とキーを指すリソースを宣言し、`app.yaml` ではそのリソースを名前で参照します。復号された値は実行時にプラットフォームが注入します。

1. Databricks CLI でシークレットの値を保存します。

   ```bash
   databricks secrets create-scope my-app-secrets
   databricks secrets put-secret my-app-secrets MY_SECRET --string-value "..."
   ```

2. `databricks.yml` でシークレットリソースを宣言します。

   ```yaml
   resources:
     apps:
       my-app:
         resources:
           - name: my-secret # このリソースのラベル（ユーザー定義）
             secret:
               scope: my-app-secrets # Databricks のシークレットスコープ名
               key: MY_SECRET # そのスコープ内のキー
               permission: READ
   ```

3. `app.yaml` で環境変数にバインドします。

   ```yaml
   env:
     - name: MY_SECRET
       valueFrom: my-secret # シークレットの値ではなく、上記のリソース名を参照する
   ```

実行時には、`MY_SECRET` に復号されたシークレットの値が格納されます。どちらのファイルにも値そのものは含まれません。

## 環境変数 \{#environment-variables\}

プラットフォームは実行時に次の変数を自動的に挿入します。

| 変数                       | 説明                                       |
| -------------------------- | ------------------------------------------ |
| `DATABRICKS_HOST`          | ワークスペースの URL                       |
| `DATABRICKS_APP_PORT`      | アプリがリッスンする必要のあるポート       |
| `DATABRICKS_APP_NAME`      | アプリ名                                   |
| `DATABRICKS_CLIENT_ID`     | サービスプリンシパルのクライアント ID      |
| `DATABRICKS_CLIENT_SECRET` | サービスプリンシパルのクライアントシークレット |
| `DATABRICKS_WORKSPACE_ID`  | ワークスペース ID                          |

カスタム変数は `app.yaml` の `env` 配下に記述します。プレーンテキストには `value`、[リソース名](#resources)には `valueFrom` を使用します。シークレットを `value` に記述しないでください。

## 認証モデル \{#auth-model\}

各アプリには専用の サービスプリンシパル が割り当てられます。Databricks は実行時に `DATABRICKS_CLIENT_ID` と `DATABRICKS_CLIENT_SECRET` を自動的に注入し、アプリが削除されると サービスプリンシパル も削除します。

**ユーザー認可** (パブリックプレビュー) では、サインイン中のユーザーのトークンを `x-forwarded-access-token` HTTP ヘッダーで転送します。スコープ (`sql`、`genie`、`files` など) は ワークスペース の UI で設定します。AppKit に組み込まれた [Genie](/ja/docs/agents/genie) プラグインと [Model Serving](/ja/docs/agents/ai-gateway) プラグインは、これを自動的に利用します。AppKit での実装については [実行コンテキスト](/ja/docs/appkit/v0/plugins/execution-context) を、プラットフォーム側の詳細については [アプリの認可](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/auth) を参照してください。

## コンピュート \{#compute\}

コンピュートサイズは `MEDIUM` (デフォルト) 、`LARGE`、`XLARGE` の 3 種類です (利用できるサイズはワークスペースによって異なります) 。サイズは、ワークスペース UI で設定するか、`databricks apps create` および `databricks apps update` の `--compute-size` フラグで指定します。サイズごとの vCPU、RAM、DBU については、[Databricks Apps のドキュメント](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/)を参照してください。

## 制約 \{#constraints\}

* 永続的なファイルシステムはありません (永続化には [Lakebase Postgres](/ja/docs/lakebase/quickstart)、DBSQL、または UC Volumes を使用してください) 
* 10 MB を超えるファイルはデプロイに失敗します
* SIGTERM から SIGKILL までの猶予は 15 秒です
* ランタイム: Ubuntu 22.04、Node 22、Python 3.11

シャットダウン処理、シークレットの適切な管理、ネットワークに関するガイドラインは [ベストプラクティス](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/best-practices) を参照してください。

## アプリのステータス \{#app-statuses\}

| ステータス | 意味 |
| --------- | ---------------------------------- |
| Running   | アプリは正常に稼働し、トラフィックを処理しています |
| Deploying | 新しいデプロイが進行中です |
| Crashed   | アプリの起動に失敗した、または異常終了しました |
| Stopped   | アプリが手動で停止されました |

## 次のステップ \{#where-to-next\}

ローカル環境のセットアップ、デプロイフラグ、プラグインAPIの全体像については [Apps development](/ja/docs/apps/development) を参照してください。実装パターンの全体像を確認したい場合は [テンプレートカタログ](/ja/templates) をご覧ください。