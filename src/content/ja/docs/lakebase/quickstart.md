---
title: クイックスタート
sourceOfTruth:
  skills:
    - databricks-apps
    - databricks-lakebase
  docs:
    - /docs/appkit/v0
    - https://docs.databricks.com/aws/en/oltp/
---

# クイックスタート \{#quickstart\}

## 前提条件 \{#prerequisites\}

- Databricks CLI `v1.0.0+`（[認証済みプロファイル](/docs/tools/databricks-cli#authenticate)が設定されていること）
- `databricks psql` を使用する場合は `psql`（PostgreSQL クライアント）。または、任意の PostgreSQL クライアントと [`generate-database-credential`](/docs/lakebase/development#local-database-access) を組み合わせて使用することもできます。
- Lakebase Postgres へのアクセスが有効になっているワークスペース

## テンプレートパス \{#template-path\}

以下のテンプレートを確認し、ユースケースに合ったものを選んで、AI コーディングアシスタントに貼り付けてください。各テンプレートには [Create a Lakebase Project](/templates/lakebase-create-instance) リソースが含まれており、プロジェクトの作成から接続情報の取得までを順を追って説明します。

| テンプレート                                                        | 適したユースケース                                             |
| ------------------------------------------------------------------- | -------------------------------------------------------------- |
| [App with Lakebase](/templates/app-with-lakebase)                   | 永続ストレージを備えた CRUD アプリ                             |
| [AI Chat App](/templates/ai-chat-app)                               | チャット履歴を伴う対話型 AI                                    |
| [Operational Data Analytics](/templates/operational-data-analytics) | Lakebase Postgres と Unity Catalog 間の双方向同期              |

## アプリをカスタマイズする \{#customize-your-app\}

Lakebase Postgres をバックエンドとするアプリをデプロイしたら、次のカスタマイズを検討してください。

- **テーブルを追加する**: [Lakebase Data Persistence](/templates/lakebase-data-persistence) テンプレートに従って、スキーマの定義、型の生成、CRUD ルートの作成を行います。
- **エージェントメモリを追加する**: [Lakebase Agent Memory](/templates/lakebase-agent-memory) テンプレートを使用して、エージェントのチャット会話を永続化します。
- **フィーチャーブランチを使う**: 開発やテスト用に分離された branch を作成します。CLI コマンドについては [開発: フィーチャーブランチ](/docs/lakebase/development#feature-branches) のセクションを参照してください。
- **Unity Catalog との間でデータを同期する**: [Lakebase Change Data Feed (CDF)](/templates/lakebase-change-data-feed-autoscaling) を使用して Lakebase Postgres のテーブルを Delta に複製する、または [Sync Tables](/templates/sync-tables-autoscaling) を使用して Unity Catalog のデータを Lakebase 経由で提供します。
- **Databricks の外部にデプロイする**: AWS、Vercel、Netlify などでホストするアプリには、[Lakebase Off-Platform](/templates/lakebase-off-platform) テンプレートを使用します。

## 手動での手順 \{#manual-path\}

templateを使わずにscaffoldした場合、`databricks apps init` が動作するAppKitプロジェクトを生成します。その前にLakebaseプロジェクトが必要です。次のコマンドで作成します。

```bash
databricks postgres create-project <project-id>
```

このIDがプロジェクトのリソース名 (`projects/<project-id>`) になります。branchや接続情報の設定を含むガイド付きセットアップについては、[Create a Lakebase Project](/templates/lakebase-create-instance) templateまたは [`databricks-lakebase`](/docs/tools/ai-tools/agent-skills) エージェントスキルを参照してください。

**インタラクティブ** (ローカル開発で推奨) : フラグを付けずに実行します。

```bash
databricks apps init
```

CLI はアプリ名の入力を求めた後、利用可能なプラグイン (機能) を一覧表示します。**Lakebase** を選択すると、既存の Lakebase プロジェクト、branch、データベースの選択手順が順に案内されます。

**非対話モード** (スクリプトや CI 向け) : `--name` と、選択した各プラグイン機能に必要な `--set` フィールドを指定します。`database` の値にはリソースの完全なパスを指定する必要があります。パスは `databricks postgres list-databases projects/<project-id>/branches/<branch-id> -o json` で取得できます (`name` フィールドの値を使用します) :

```bash
databricks apps init --name my-app --features lakebase \
  --set lakebase.postgres.project=projects/<project-id> \
  --set lakebase.postgres.branch=projects/<project-id>/branches/<branch-id> \
  --set lakebase.postgres.database=projects/<project-id>/branches/<branch-id>/databases/<database-id>
```

次に、先にデプロイしてスキーマを作成してから、ローカルで実行します。

```bash
cd my-app
databricks apps deploy
```

:::tip
`npm run dev` の前に `databricks apps deploy` を実行してください。デプロイを行うとマネージドID (アプリのサービスプリンシパル) が設定され、初回起動時にこのIDがデータベーススキーマを作成します。先に `npm run dev` を実行すると、スキーマがご自身の個人資格情報で作成されてしまい、後からデプロイしてもアプリのマネージドIDからアクセスできなくなります。詳しくは[ローカルセットアップ](/docs/lakebase/development#local-setup)を参照してください。
:::

```bash
npm install && npm run dev
```


## 次のステップ \{#where-to-next\}

ローカル開発のワークフロー、フィーチャーブランチ、プラグイン API の詳細については、[Lakebase Postgres 開発](/docs/lakebase/development)を参照してください。