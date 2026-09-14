---
title: エージェントスキル
sourceOfTruth:
  skills:
    - databricks-core
  docs:
    - https://github.com/databricks/databricks-agent-skills
---

# エージェントスキル \{#agent-skills\}

エージェントスキルは、AI コーディングアシスタントが Databricks の開発タスクを実行するために読み込む指示ファイルです。Databricks はスキルを [databricks/databricks-agent-skills](https://github.com/databricks/databricks-agent-skills) リポジトリで公開しており、オープンな [エージェントスキル標準](https://agentskills.io/)に準拠しています。

スキルは、CLI の規約、認証パターン、リソース名など、Databricks の仕組みをコーディングエージェントに伝えます。これにより、エージェントは推測に頼ることなく、正しいコードを生成できます。

## インストール \{#install\}

次のコマンドで、公式の Databricks エージェントスキルをインストールします。

```bash title="Common"
databricks aitools install
```

```bash title="All Options"
databricks aitools install \
  --scope $SCOPE \
  --agents $AGENTS \
  --skills $SKILLS \
  --skills-only \
  --path $OUTPUT_DIR \
  --experimental \
  --debug \
  -o json \
  --target $TARGET \
  --profile $DATABRICKS_PROFILE
```

:::note
これには Databricks CLI のインストールが必要です。インストール手順については [Databricks CLI](/docs/tools/databricks-cli) を参照してください。
:::

CLI は、インストール済みのコーディングエージェントを検出します。プラグインに対応しているエージェント (Claude Code、Codex CLI、GitHub Copilot) では、そのエージェント自身の CLI を通じて `databricks` プラグインをインストールします。ヘッドレスでのプラグインインストールに対応していないエージェント (Cursor、OpenCode、Antigravity) では、共有の場所 (`~/.databricks/aitools/skills/`) からリンクされたスキルファイルがそのまま配置されます。

`databricks aitools install` のオプション:

<!-- cli-options:aitools install -->

| オプション             | 説明                                                          |
| ----------------- | ----------------------------------------------------------- |
| `--agents`        | インストール対象のエージェント (カンマ区切り、例: claude-code,cursor)              |
| `--experimental`  | 実験的なスキルを含める                                                 |
| `--path`          | 解決済みのスキルファイルをこのディレクトリに書き出す (エージェントなし、状態なし)                  |
| `--scope`         | インストールスコープ: project または global (デフォルト: global、対話モードでは確認あり)  |
| `--skills`        | インストールするスキルを指定 (カンマ区切り)                                     |
| `--skills-only`   | すべてのエージェントでプラグインを使わず、スキルファイルをそのまま使用する                       |
| `--debug`         | デバッグログを有効にする                                                |
| `--output`, `-o`  | 出力形式: text または json (デフォルトは text)                           |
| `--profile`, `-p` | ~/.databrickscfg のプロファイル                                    |
| `--target`, `-t`  | 使用するバンドルターゲット (該当する場合)                                      |

<!-- /cli-options -->

なお、`--skills-only` と `--path` は併用できません。


## 管理 \{#manage\}

```bash title="List, update, or remove skills"
databricks aitools list
databricks aitools update
databricks aitools uninstall
```

`update` は最新リリースを取得し、新しいスキルを自動的にインストールします。ダウンロードせずに内容を確認するには `--check`、新しいスキルの自動インストールをスキップするには `--no-new`、マニフェストから削除されたスキルをそのまま残すには `--no-prune`、バージョンが一致していても再ダウンロードするには `--force` を指定します。

`uninstall` はプラグインまたはスキルのファイルを削除します。プラグインを削除してもマーケットプレイスへの登録を残したい場合は `--keep-marketplace` を指定します。

すべてのコマンドでスコープを制御する `--scope` を指定できます。`install` と `uninstall` では `project` または `global`、`update` と `list` ではこれに加えて `both` も指定できます (`list` の既定値は `both`) 。


## その他のインストール方法 \{#alternative-install-methods\}

Databricks のスキルは、[Skills CLI](https://github.com/vercel-labs/skills)（例: `npx skills add databricks/databricks-agent-skills`）を使ってインストールすることも、Cursor のチャットから `/add-plugin databricks` で直接インストールすることもできます。とはいえ、推奨される方法は `databricks aitools install` です。Databricks が保守しており、常に最新の安定版がインストールされます。

## 利用可能なスキル \{#available-skills\}

`databricks aitools list` を実行すると、利用可能なスキルとそのインストール状況を確認できます。

<!-- aitools-skills -->

| スキル                                      | 説明                                                                                                                                                                                                                                                                                                                                           |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `databricks-agent-bricks`                | ドキュメントのQ&amp;A向けのKnowledge Assistant (KA) と、マルチエージェント オーケストレーション (MAS) 向けのSupervisor Agentを作成します。                                                                                                                                                                                                                                            |
| `databricks-ai-functions`                | モデルエンドポイントを管理することなく、Databricks 組み込みの AI Functions (ai&#95;classify、ai&#95;extract、ai&#95;summarize、ai&#95;mask、ai&#95;translate、ai&#95;fix&#95;grammar、ai&#95;gen、ai&#95;analyze&#95;sentiment、ai&#95;similarity、ai&#95;parse&#95;document、ai&#95;prep&#95;search、ai&#95;query、ai&#95;forecast) を使用して、SQL および PySpark パイプラインに AI 機能を直接追加します。 |
| `databricks-aibi-dashboards`             | Databricks AI/BI ダッシュボードを作成します。                                                                                                                                                                                                                                                                                                              |
| `databricks-app-design`                  | カスタムコードで構築する Databricks Apps (AppKit/React) のデータ画面 (KPI／概要ページ、レポート、グラフ、表、Genie／チャットデータアシスタント) の UX を設計し、具体的な AppKit コンポーネントに対応付けます。                                                                                                                                                                                                          |
| `databricks-apps`                        | Databricks Apps プラットフォーム上でアプリを構築します。                                                                                                                                                                                                                                                                                                         |
| `databricks-apps-python`                 | Databricks Apps 向けの Python バックエンド — FastAPI (デフォルト) 、Flask、Dash、Streamlit、Gradio、Reflex。**新規の Databricks App のデフォルトは `databricks-apps` (AppKit — Node/TypeScript/React) です。まずはこちらを使用してください。** このスキルは、ユーザーが Python バックエンドを希望する場合、既存の Python アプリを拡張する場合、またはチームが Python のみを扱う場合にのみ使用してください。                                                     |
| `databricks-core`                        | Databricks CLI の操作と、Databricks CLI を使用するための親／エントリポイントスキル (認証、プロファイル選択、バンドル) 。                                                                                                                                                                                                                                                                |
| `databricks-dabs`                        | Declarative Automation Bundles (DAB、旧称 Databricks Asset Bundles) を作成、構成、検証、デプロイ、実行、管理します。                                                                                                                                                                                                                                                    |
| `databricks-data-discovery`              | Genie を介して Databricks データを検出、探索、クエリできます。Genie One MCP に相当する CLI です。                                                                                                                                                                                                                                                                          |
| `databricks-dbsql`                       | Databricks SQL (DBSQL) の高度な機能と SQL warehouse の機能。                                                                                                                                                                                                                                                                                            |
| `databricks-docs`                        | llms.txt インデックスを介した Databricks ドキュメントの参照。                                                                                                                                                                                                                                                                                                    |
| `databricks-execution-compute`           | Databricks でコードを実行し、compute を管理します。サーバーレス、クラシック、または対話型クラスターで Python/Scala/SQL/R を実行し、クラスターと SQL warehouse の作成、サイズ変更、削除を行えます。                                                                                                                                                                                                                 |
| `databricks-iceberg`                     | Databricks 上の Apache Iceberg テーブル — マネージド Iceberg テーブル、外部 Iceberg 読み取り (旧称 Uniform) 、互換モード、Iceberg REST Catalog (IRC) 、Iceberg v3、Snowflake との相互運用、PyIceberg、OSS Spark、外部エンジンからのアクセス、認証情報の払い出し。                                                                                                                                              |
| `databricks-jobs`                        | DAB、Python SDK、または CLI を使用して、Databricks 上で Lakeflow Jobs を開発・デプロイします。                                                                                                                                                                                                                                                                        |
| `databricks-lakebase`                    | Databricks Lakebase Postgres：プロジェクト、スケーリング、接続、Lakebase 同期テーブル、Data API。                                                                                                                                                                                                                                                                      |
| `databricks-lakeflow-connect`            | Lakeflow Connect を使用して、Databricks にデータを取り込むマネージドパイプラインを構築します。                                                                                                                                                                                                                                                                                |
| `databricks-metric-views`                | Unity Catalog メトリックビュー: YAML でガバナンスされたビジネス指標を定義、作成、クエリ、管理します。                                                                                                                                                                                                                                                                                |
| `databricks-ml-training`                 | Databricks で ML モデルをトレーニングします。                                                                                                                                                                                                                                                                                                               |
| `databricks-mlflow-evaluation`           | MLflow 3 による GenAI エージェントの評価。                                                                                                                                                                                                                                                                                                                |
| `databricks-model-serving`               | Databricks Model Serving エンドポイントのライフサイクルと運用。                                                                                                                                                                                                                                                                                                 |
| `databricks-pipelines`                   | Databricks で Lakeflow Spark Declarative Pipelines (旧 Delta Live Tables) を開発します。                                                                                                                                                                                                                                                              |
| `databricks-python-sdk`                  | Python SDK、Databricks Connect、CLI、REST API など、Databricks 開発に関するガイダンス。                                                                                                                                                                                                                                                                        |
| `databricks-serverless-migration`        | Databricks ワークロードをクラシック コンピュートからサーバーレス コンピュートへ移行します。                                                                                                                                                                                                                                                                                         |
| `databricks-spark-structured-streaming`  | 本番ワークロード向けの Spark Structured Streaming の包括的なガイド。                                                                                                                                                                                                                                                                                             |
| `databricks-synthetic-data-gen`          | Spark + Faker を使用して、現実的な合成データを生成します (強く推奨) 。                                                                                                                                                                                                                                                                                                 |
| `databricks-unity-catalog`               | Unity Catalog のガバナンス、アクセス制御、可観測性。                                                                                                                                                                                                                                                                                                            |
| `databricks-unstructured-pdf-generation` | Databricks で RAG／非構造化ドキュメント向けの評価データセットとデモ用ドキュメント (例: Knowledge Assistant 用) を構築します。合成 PDF をローカルで生成して Unity Catalog ボリュームにアップロードし、各ドキュメントに検索評価用のテスト質問を対応付けます。                                                                                                                                                                                 |
| `databricks-vector-search`               | RAG とセマンティック検索向けの Databricks Vector Search エンドポイントとインデックス。インデックスの種類、検索モード、エンドツーエンドの RAG パターンを取り上げます。                                                                                                                                                                                                                                         |
| `databricks-zerobus-ingest`              | gRPC 経由で Databricks Delta テーブルにほぼリアルタイムでデータを取り込むための Zerobus Ingest クライアントを構築します。                                                                                                                                                                                                                                                             |

<!-- /aitools-skills -->

以下のスキルは実験的機能です。インストールするには、`databricks aitools install` に `--experimental` を追加してください:

<!-- aitools-skills-experimental -->

| スキル                      | 説明                                                                                                                                    |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `databricks-ai-runtime`    | Databricks AI Runtime（`air`）CLI — Databricks サーバーレス compute 上で GPU トレーニングワークロードを送信・管理するためのコマンドラインツール。 |
| `databricks-genie`         | 自然言語による SQL 探索のための Databricks Genie Space を作成し、クエリを実行します。                                                                 |
| `spark-python-data-source` | PySpark DataSource API を使用して Apache Spark 向けのカスタム Python データソースを構築 — 外部システムとの連携に使うバッチおよびストリーミングのリーダー/ライター。 |

<!-- /aitools-skills-experimental -->

## 次のステップ \{#where-to-next\}

Databricks のエージェントスキルをインストールすると、コーディングエージェントは構築とデプロイに必要なコンテキストを利用できるようになります。

- エージェントにさらにコンテキストを与えるには、[Docs MCP Server](/docs/tools/ai-tools/docs-mcp-server) をインストールしてください。
- 構築を始める準備ができたら、[テンプレート](/docs/templates)を使ってプロジェクトの雛形をすばやく作成する方法をご覧ください。