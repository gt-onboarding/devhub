---
title: templatesとは
sidebar_label: templatesとは
description: templatesは、コーディングアシスタントにDatabricksでのビルド作業を遂行させるための、コピー&ペーストで使えるエージェントプロンプトです。アプリ全体のスキャフォールディングから、既存アプリへの機能追加まで対応します。
---

# templatesとは？ \{#what-are-templates\}

DevHubには、Databricksアプリのひな型を素早く作成できる[templates](/ja/templates)のコレクションが用意されています。

**template** とは、要するにエージェント向けのプロンプトです。コーディングアシスタント (Cursor、Claude Code、Codex、あるいはエディタ上で動作する任意のエージェント) に貼り付けるテキストのかたまりで、Databricks上で何をどう構築すればよいかを正確に指示します。

実際の構築作業はアシスタントが担います。アシスタントが確認の質問を投げかけ、Databricks CLIを実行し、コードを書き、デプロイまで行います。ユーザーは大枠の判断を下す役割で関与しますが、個々のコマンドを把握したり覚えておいたりする必要はありません。

## テンプレートの使い方 \{#how-to-use-a-template\}

このサイトのテンプレートには、いずれも上部に **Copy prompt** ボタンがあります。

1. [/templates](/ja/templates) でテンプレートを開き、作りたいものに合ったものを選びます。
2. **Copy prompt** をクリックし、コピーした内容をコーディングエージェントに貼り付けます。
3. エージェントはプロンプトを読み取り、必要な項目 (どのworkspaceか、どのカタログか、実データかシードデータか、など) を質問したうえで、構築を進めます。

## 種類 \{#the-flavors\}

templatesには、エンドツーエンドのアプリtemplatesとタスクtemplatesの2種類があります。

### エンドツーエンドのアプリ templates \{#end-to-end-app-templates\}

エージェントが Databricks アプリをゼロから構築します。UI、サーバー、Databricks リソース、デプロイ手順まで一式が含まれます。新規プロジェクトを立ち上げ、ユースケースに合わせて調整できる動作するアプリが欲しい場合に使用してください。

例:

* [App with Lakebase](/ja/templates/app-with-lakebase) — マネージド Postgres をバックエンドとする CRUD アプリ。
* [AI Chat App](/ja/templates/ai-chat-app) — ストリーミング応答と永続的な会話履歴を備えたチャットアプリ。
* [Vacation Rentals Operations Console](/ja/templates/vacation-rentals) — Lakebase によるフラグとエージェントノート、SQL warehouse による収益分析、埋め込み型 Genie チャットパネルを備えた予約キュー。

エンドツーエンドの templates の中には、Databricks の [app-templates](https://github.com/databricks/app-templates) リポジトリにあるデプロイ可能なスターターコードベースを含むものもあります。その場合、エージェントはそれをクローンして出発点とし、データ、workspace、ユースケースに合わせて調整します。

### タスクtemplates \{#task-templates\}

エージェントが既存プロジェクトに対して、目的を絞った1つの作業を実行します。すでにDatabricksアプリがあり、そこに機能を追加したい場合に使用します。

例:

* [Onboard Your Coding Agent](/ja/templates/onboard-your-coding-agent) — Databricksプラットフォームのスキルと Docs MCP Server をリポジトリにインストールします。
* [Lakebase Data Persistence](/ja/templates/lakebase-data-persistence) — 既存のアプリにマネージドPostgresストレージを追加します。
* [Create a Lakebase Project](/ja/templates/lakebase-create-instance) — Lakebaseプロジェクトをプロビジョニングし、接続情報を取得します。

タスクtemplatesは組み合わせて使えるように設計されています。複数をつなぎ合わせれば、空のリポジトリからデプロイ済みアプリまで到達でき、これはエンドツーエンドのtemplatesが内部で行っていることでもあります。

## 次のステップ \{#where-to-go-next\}

* [templatesカタログ](/ja/templates)の全体を見る。
* アプリ構築に活用できるDatabricksプラットフォームの各サービスをさらに詳しく見る: [Databricks Apps](/ja/docs/apps/overview)、[Lakebase Postgres](/ja/docs/lakebase/overview)、[Agent Bricks](/ja/docs/agents/overview)、[Data Lakehouse](/ja/docs/lakehouse/overview)。