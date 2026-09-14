---
title: アプリ開発
sidebar_label: 開発
sourceOfTruth:
  skills:
    - databricks-apps
  docs:
    - /docs/appkit/v0
    - https://docs.databricks.com/aws/en/dev-tools/databricks-apps/
---

# アプリ開発 \{#app-development\}

このページは、Databricks Apps と AppKit の CLI およびワークフローのリファレンスです。プラグインの追加、scaffold、デプロイ、管理、トラブルシューティングまでを解説します。

以下の各コマンドでは、代表的な実行例、利用可能なフラグの一覧、および各フラグの説明表を示します。CLI が信頼できる情報源であるため、フラグの最新の挙動は `databricks <command> --help` を実行して確認してください。

## ローカルセットアップ \{#local-setup\}

`npm run dev` を実行する前に、`.env.example` を `.env` にコピーし、ワークスペースの URL とリソース ID を記入してください。AppKit はこれらの値を読み取り、Databricks リソースへのローカル接続に使用します。

[Lakebase Postgres](/docs/lakebase/quickstart) を使用するアプリの `.env` の例:

```text
DATABRICKS_HOST=https://<workspace>.cloud.databricks.com
LAKEBASE_ENDPOINT=projects/<project>/branches/production/endpoints/primary
```

アプリが Lakebase を使用している場合は、ローカルで実行する前にローカルユーザーにも `databricks_superuser` ロールを付与してください。スキーマとテーブルは初回デプロイ時にアプリのサービスプリンシパルが作成し、その所有者になります。このロールを付与しないと、ローカルの ID ではこれらのオブジェクトにアクセスできません。

```sql
GRANT databricks_superuser TO "<your-email>";
```

ローカルアクセスのワークフロー全体については、[Lakebase 開発](/docs/lakebase/development#local-database-access)を参照してください。

再デプロイせずに本番データに対してテストする方法については、[リモートブリッジ](/docs/appkit/v0/development/remote-bridge)を参照してください。


## プラグインを追加する \{#add-a-plugin\}

既存のアプリにプラグインを追加するには、`server/server.ts` の `createApp` でプラグインをインポートして登録します。

```typescript
import { createApp, genie, lakebase, server } from "@databricks/appkit";

const AppKit = await createApp({
  plugins: [server(), lakebase(), genie()],
});
```

次に、更新されたリソース要件を反映して `appkit.plugins.json` を再生成します。

```bash
npx @databricks/appkit plugin sync --write
```

これは `npm run dev` および `npm run build` の実行時に自動的に行われます。更新された `appkit.plugins.json` はコードと一緒にコミットしてください。このファイルによって、デプロイパイプラインはどのリソースをプロビジョニングするかを判断します。

各プラグインの設定オプションについては [AppKit プラグインリファレンス](/docs/appkit/v0/plugins) を、独自のプラグインを追加する方法については [カスタムプラグインの作成](/docs/appkit/v0/plugins/custom-plugins) を参照してください。


## プラグインを探す \{#discover-plugins\}

利用可能なプラグインと、それぞれに必要なリソースフィールドを一覧表示します。

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

| オプション             | 説明                                                                                 |
| ----------------- | ---------------------------------------------------------------------------------- |
| `--branch`        | Git のブランチまたはタグ (GitHub テンプレートの場合。--version とは併用不可)                             |
| `--template`      | テンプレートのパス (ローカルディレクトリまたは GitHub URL)                                            |
| `--version`       | デフォルト テンプレートで使用する AppKit のバージョン (デフォルト: main、main ブランチを使う場合は &#39;latest&#39;)  |
| `--debug`         | デバッグログを有効にする                                                                       |
| `--output`, `-o`  | 出力形式: text または json (デフォルトは text)                                                  |
| `--profile`, `-p` | ~/.databrickscfg のプロファイル                                                           |
| `--target`, `-t`  | 使用するバンドルターゲット (該当する場合)                                                             |
| `--var`           | バンドル設定で定義された変数に値を設定する。例: --var=&quot;key=value&quot;                               |

<!-- /cli-options -->


## Scaffold オプション \{#scaffold-options\}

新しい AppKit プロジェクトを scaffold するには、`databricks apps init` を使用します。最短の手順については [Apps クイックスタート](/docs/apps/quickstart) を参照してください。非対話的な scaffold や高度な scaffold を行う場合は、以下のオプションを使用します。

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

| オプション             | 説明                                                                  |
| ----------------- | ------------------------------------------------------------------- |
| `--branch`        | Git のブランチまたはタグ (GitHub テンプレートの場合。--version とは排他)                    |
| `--deploy`        | 作成後にアプリをデプロイする                                                      |
| `--description`   | アプリの説明                                                              |
| `--features`      | 有効化する機能／プラグイン (カンマ区切り。テンプレートマニフェストで定義されたもの)                         |
| `--output-dir`    | プロジェクトの出力先ディレクトリ                                                    |
| `--run`           | 作成後にアプリを実行する (none、dev、dev-remote)                                  |
| `--set`           | リソースの値を設定する (形式: plugin.resourceKey.field=value。複数指定可)              |
| `--skip-install`  | プロジェクトの依存関係のインストール (npm install / uv sync など) をスキップする。--run とは併用不可。 |
| `--template`      | テンプレートのパス (ローカルディレクトリまたは GitHub URL)                                |
| `--version`       | 使用する AppKit のバージョン (デフォルト: 自動検出。main ブランチを使うには &#39;latest&#39;)    |
| `--debug`         | デバッグログを有効にする                                                        |
| `--output`, `-o`  | 出力形式: text または json (デフォルトは text)                                   |
| `--profile`, `-p` | ~/.databrickscfg のプロファイル                                            |
| `--target`, `-t`  | 使用するバンドルターゲット (該当する場合)                                              |
| `--var`           | バンドル設定で定義された変数に値を設定する。例: --var=&quot;key=value&quot;                |

<!-- /cli-options -->

`--name` を指定するとプロンプトは表示されず、指定しなかったオプションにはデフォルト値が使われます。アプリ名は小文字とハイフンのみで、26 文字以内にする必要があります。利用可能なプラグインとその `--set` キーを確認するには `databricks apps manifest` を実行してください。


## 環境設定 \{#environment-configuration\}

**ローカル** (`npm run dev`) : プロジェクトルートの `.env` で定義した変数が使われます。

**デプロイ時**: `app.yaml` の `env` エントリで定義した変数が使われます。単純な文字列には `value`、リソースバインディングには `valueFrom` を指定します:

```yaml
env:
  - name: LAKEBASE_ENDPOINT
    valueFrom: postgres
  - name: WAREHOUSE_ID
    valueFrom: sql-warehouse
  - name: APP_LOG_LEVEL
    value: info
```

`valueFrom` で参照するリソースは `databricks.yml` で宣言する必要があります。リソースの一覧については [設定](/docs/apps/configuration#resources) を参照してください。


## デプロイ前チェックリスト \{#pre-deploy-checklist\}

本番環境へデプロイする前に、以下を確認してください。

- アプリが `DATABRICKS_APP_PORT` の `0.0.0.0` にバインドしている
- `app.yaml` の command が配列構文になっている（シェル文字列ではない）
- プロジェクト内に 10 MB を超えるファイルがない
- シークレットに `valueFrom` を使用している（`value` は使わない）
- `databricks.yml` に必要なリソースがすべて宣言されている
- `databricks apps validate` が成功する（`--skip-tests` を指定するとテストをスキップして実行を短縮できます）
- ローカルで `npm run build` が成功する

## 検証 \{#validate\}

デプロイ前に、アプリのプロジェクトディレクトリから検証を実行します。

```bash
databricks apps validate --profile $DATABRICKS_PROFILE
```

検証ではビルド、型チェック、リントを実行します。実行時間を短縮するには `--skip-tests` を指定してください。


## デプロイ \{#deploy\}

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

| オプション                    | 説明                                                                        |
| ------------------------ | ------------------------------------------------------------------------- |
| `--auto-approve`         | デプロイに必要となる可能性のある対話的な承認をスキップします。                                           |
| `--deployment-id`        | デプロイの一意な ID。                                                              |
| `--force`                | Git ブランチの検証を強制的に上書きします。                                                   |
| `--git-branch`           | デプロイ元となる Git ブランチ。                                                        |
| `--git-commit`           | デプロイ元となる Git コミット SHA。                                                    |
| `--git-source-code-path` | Git リポジトリ内のアプリソースコードへの相対パス。既定値はリポジトリのルートです。                               |
| `--git-tag`              | デプロイ元となる Git タグ。                                                          |
| `--json`                 | リクエストボディとしてインライン JSON 文字列または @path/to/file.json を指定 (既定値 JSON (0 bytes))  |
| `--mode`                 | デプロイがソースコードを管理する方式。サポートされる値: [AUTO&#95;SYNC, SNAPSHOT]                    |
| `--no-wait`              | SUCCEEDED 状態への到達を待機しません                                                   |
| `--skip-tests`           | 検証中のテスト実行をスキップします (既定値 true)                                              |
| `--skip-validation`      | プロジェクトの検証 (ビルド、型チェック、lint) をスキップします                                       |
| `--source-code-path`     | アプリのデプロイ作成に使用するソースコードのワークスペースファイルシステム上のパス。                                |
| `--timeout`              | SUCCEEDED 状態に到達するまでの最大待機時間 (既定値 20m0s)                                    |
| `--debug`                | デバッグログを有効にします                                                             |
| `--output`, `-o`         | 出力形式: text または json (既定値 text)                                            |
| `--profile`, `-p`        | ~/.databrickscfg のプロファイル                                                  |
| `--target`, `-t`         | 使用するバンドルターゲット (該当する場合)                                                    |
| `--var`                  | バンドル設定で定義された変数に値を設定します。例: --var=&quot;key=value&quot;                     |

<!-- /cli-options -->

CLI は設定を検証し、プロジェクトをビルドしてアップロードしたうえでアプリを起動します。既定では `databricks apps validate` と同じプロジェクト検証 (ビルド、型チェック、lint) を実行します。この手順をスキップするには `--skip-validation` を指定してください。scaffold した AppKit プロジェクトからデプロイする場合、`--source-code-path` の指定は不要です。


### デプロイを確認する \{#verify-the-deployment\}

アプリが正常にデプロイされたことを確認します。

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

| オプション             | 説明                                                   |
| ----------------- | ---------------------------------------------------- |
| `--debug`         | デバッグログを有効にする                                         |
| `--output`, `-o`  | 出力形式: text または json (デフォルトは text)                    |
| `--profile`, `-p` | ~/.databrickscfg のプロファイル                             |
| `--target`, `-t`  | 使用するバンドルターゲット (該当する場合)                               |
| `--var`           | バンドル設定で定義された変数に値を設定する。例: --var=&quot;key=value&quot; |

<!-- /cli-options -->

<details>
<summary>出力例</summary>

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

ログの確認:

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

| オプション             | 説明                                                     |
| ----------------- | ------------------------------------------------------ |
| `--follow`, `-f`  | 中断されるまでログのストリーミングを継続します。                               |
| `--tail-lines`    | ストリーミング開始前に表示する直近のログ行数。すべて表示する場合は 0 を指定します。(デフォルト 200) |
| `--timeout`       | --follow 指定時にストリーミングを継続する最大時間。0 を指定するとタイムアウトを無効化します。   |
| `--search`        | ストリーミング前にログサービスへ検索語を送信します。                             |
| `--source`        | ログを APP または SYSTEM のソース(あるいはその両方)に限定します。               |
| `--output-file`   | 標準出力に加えてログを書き出すファイルパス(任意)。                             |
| `--debug`         | デバッグログを有効化します                                          |
| `--output`, `-o`  | 出力形式: text または json (デフォルト text)                       |
| `--profile`, `-p` | ~/.databrickscfg のプロファイル                               |
| `--target`, `-t`  | 使用するバンドルターゲット(該当する場合)                                  |
| `--var`           | バンドル設定で定義された変数に値を設定します。例: --var=&quot;key=value&quot;  |

<!-- /cli-options -->


<details>
<summary>ログ出力の例</summary>

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


## アプリの管理 \{#managing-apps\}

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


#### `apps stop` のオプション \{#apps-stop-options\}

<!-- cli-options:apps stop -->

| オプション        | 説明                                                                          |
| ----------------- | ----------------------------------------------------------------------------- |
| `--no-wait`       | STOPPED 状態になるまで待機しない                                              |
| `--timeout`       | STOPPED 状態になるまでの最大待機時間（デフォルト 20m0s）                      |
| `--debug`         | デバッグログを有効にする                                                      |
| `--output`, `-o`  | 出力形式: text または json（デフォルト text）                                 |
| `--profile`, `-p` | ~/.databrickscfg のプロファイル                                               |
| `--target`, `-t`  | 使用するバンドルターゲット（該当する場合）                                    |
| `--var`           | バンドル設定で定義された変数に値を設定する。例: --var="key=value"             |

<!-- /cli-options -->

#### `apps start` オプション \{#apps-start-options\}

<!-- cli-options:apps start -->

| オプション        | 説明                                                                          |
| ----------------- | ----------------------------------------------------------------------------- |
| `--no-wait`       | ACTIVE 状態になるまで待機しない                                               |
| `--timeout`       | ACTIVE 状態になるまでの最大待機時間（デフォルト 20m0s）                       |
| `--debug`         | デバッグログを有効にする                                                      |
| `--output`, `-o`  | 出力形式: text または json（デフォルト text）                                 |
| `--profile`, `-p` | ~/.databrickscfg のプロファイル                                               |
| `--target`, `-t`  | 使用するバンドルターゲット（該当する場合）                                    |
| `--var`           | バンドル設定で定義された変数に値を設定する。例: --var="key=value"             |

<!-- /cli-options -->

#### `apps delete` のオプション \{#apps-delete-options\}

<!-- cli-options:apps delete -->

| オプション            | 説明                                                                   |
| ----------------- | ----------------------------------------------------------------------------- |
| `--auto-approve`  | リソースとファイルの削除時の対話的な承認をスキップします                   |
| `--force-lock`    | デプロイロックを強制的に取得します。                                         |
| `--debug`         | デバッグログを有効にします                                                          |
| `--output`, `-o`  | 出力形式: text または json（デフォルトは text）                                      |
| `--profile`, `-p` | ~/.databrickscfg のプロファイル                                                      |
| `--target`, `-t`  | 使用するバンドルターゲット（該当する場合）                                          |
| `--var`           | バンドル設定で定義された変数に値を設定します。例: --var="key=value" |

<!-- /cli-options -->

`apps delete` は確認プロンプトを表示します。CI では `--auto-approve` を指定してプロンプトをスキップしてください。

## CI/CD \{#cicd\}

CI で自動デプロイを行う場合は、`DATABRICKS_HOST` と `DATABRICKS_TOKEN` を設定します (または `DATABRICKS_CLIENT_ID` と `DATABRICKS_CLIENT_SECRET` を使って OAuth を利用します) :

```bash
DATABRICKS_HOST=https://<workspace>.cloud.databricks.com \
DATABRICKS_TOKEN=dapi... \
databricks apps deploy
```

または、事前に構成済みのプロファイルを使用します。

```bash
databricks apps deploy --profile ci-profile
```

すべての認証方法については、[Databricks CLI の認証ドキュメント](/docs/tools/databricks-cli#authenticate)を参照してください。


## トラブルシューティング \{#troubleshooting\}

その他のトラブルシューティングについては [アプリのデプロイ](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/deploy#troubleshoot) を、ローカル接続の問題については [AppKit リモートブリッジ](/docs/appkit/v0/development/remote-bridge) を参照してください。

- **アプリのデプロイに失敗する**: ログのエラーメッセージを確認し、`app.yaml` の構文を検証したうえで、`env` セクションのシークレットや環境変数が正しく解決されるかを確認してください。依存関係がすべて含まれている、またはインストールされていることも確認します。
- **401 エラー（認証）**: トークンが有効であること（`databricks auth token --profile <PROFILE>`）、有効期限が切れていないこと、必要な OAuth スコープが含まれていることを確認してください。トークンのスコープは、アプリの[ユーザー認可](/docs/appkit/v0/plugins/execution-context)に設定されたスコープを包含している必要があります。
- **403 エラー（権限拒否）**: アプリに対する `CAN USE` 権限があることを確認してください。権限が十分でも、OAuth スコープが不足していると 403 が発生することがあります。
- **404 エラー（アプリが見つからない）**: アプリ名とワークスペース URL が正しいこと、アプリがデプロイされて実行中であること、エンドポイントのパスが存在することを確認してください。
- **Git デプロイに失敗する**: プライベートリポジトリの場合は、アプリのサービスプリンシパルに Git 資格情報が設定されているかを確認してください。CLI/API/DABs 経由でデプロイする場合は、先にアプリを作成してから Git 資格情報を追加します。

## AppKit ドキュメント \{#appkit-docs\}

AppKit の API リファレンス、コンポーネントドキュメント、プラグインドキュメントには、ターミナルからアクセスできます。

```bash
npx @databricks/appkit docs                        # ドキュメントの索引を表示
npx @databricks/appkit docs --full                 # すべてのAPIエントリを含む完全な索引
npx @databricks/appkit docs "<query-or-doc-path>"  # 特定のセクションまたはファイルを表示
```

引数なしで実行すると、インデックスを閲覧できます。AI コーディングアシスタントを使って開発する際に便利です。API の形式を推測させるのではなく、ここを参照させるか、本サイトの [AppKit リファレンス](/docs/appkit/v0) を参照してください。


## 次のステップ \{#where-to-next\}

[テンプレートカタログ](/templates)を見て開発を始めるか、アプリに機能を追加しましょう。永続ストレージには [Lakebase Postgres](/docs/lakebase/overview)、AI 機能には [Agent Bricks](/docs/agents/overview) を利用できます。