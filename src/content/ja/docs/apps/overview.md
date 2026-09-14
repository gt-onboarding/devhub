---
title: Databricks Apps とは
sidebar_label: 概要
description: Databricks Apps は、組み込みの認証、マネージドコンピュート、データへの直接アクセスを備えた Web アプリケーションをワークスペース内でホストします。
sourceOfTruth:
  skills:
    - databricks-apps
  docs:
    - /docs/appkit/v0
    - https://docs.databricks.com/aws/en/dev-tools/databricks-apps/
  note: "AppKit（TypeScript SDK）については、DevHub と databricks-apps スキルで解説しています。docs.databricks.com が扱うのは AppKit ではなく、Apps プラットフォーム（デプロイ、認証、ランタイム）です。"
---

# Databricks Apps とは \{#what-is-databricks-apps\}

Databricks Apps は、ワークスペース内で Web アプリをホストします。固定 URL、組み込みの OAuth、ワークスペースのデータとサービスへの直接アクセスが利用できます。別途ホスティングサービスを用意する必要も、認証レイヤーを自作する必要も、資格情報のローテーションを管理する必要もありません。

**[AppKit](/docs/appkit/v0)** は、こうしたアプリを構築するための TypeScript SDK です。あらかじめ用意された React UI コンポーネント、型安全なデータアクセス、Databricks サービスに接続するためのプラグインシステムを提供します。

## 仕組み \{#how-it-works\}

AppKit は 3 層アーキテクチャを採用しており、各層に機能を登録するプラグインで構成されます。

- **クライアント**: Vite が配信する React フロントエンド。`@databricks/appkit-ui` パッケージは、データテーブル、チャート、ダイアログ、レイアウトコンポーネントを提供します。
- **サーバー**: Databricks OAuth を組み込んだ Express HTTP サーバー。プラグインはこの層でルートとミドルウェアを追加します。
- **データ**: Databricks リソースへのプラグインベースのアクセス。各プラグインはリソースタイプをラップし、`AppKit` オブジェクト上に型付き API を公開します。

| プラグイン                                           | 追加される機能                                                                                                                                                                  |
| ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [**server**](/docs/appkit/v0/plugins/server)         | Express HTTP サーバー、静的ファイル配信、Vite 開発モード（常に含まれます）                                                                                                     |
| [**lakebase**](/docs/appkit/v0/plugins/lakebase)     | [Lakebase Postgres](/docs/lakebase/quickstart) 向けの Postgres 接続プール。OAuth トークンの自動更新に対応                                                                |
| [**analytics**](/docs/appkit/v0/plugins/analytics)   | [Databricks SQL Warehouses](https://docs.databricks.com/aws/en/compute/sql-warehouse/) に対する SQL クエリの実行。[分析的な読み取り](/docs/lakehouse/analytical-reads)を参照してください。 |
| [**genie**](/docs/appkit/v0/plugins/genie)           | 自然言語によるデータクエリを可能にする [Genie Agent](/docs/agents/genie) 連携                                                                                               |
| [**serving**](/docs/appkit/v0/plugins/model-serving) | [Model Serving](/docs/agents/ai-gateway) endpoint への認証済みプロキシ。ストリーミングに対応                                                                              |
| [**files**](/docs/appkit/v0/plugins/files)           | [Unity Catalog Volumes](https://docs.databricks.com/aws/en/files/) に対するファイル操作                                                                                    |
| [**agents**](/docs/appkit/v0/plugins/agents)         | Markdown またはコードで定義する AI エージェント。ツールの自動検出に対応                                                                                               |
| [**ai-search**](/docs/appkit/v0/plugins/ai-search)   | AI Search インデックスに対するセマンティック検索およびベクトル検索                                                                                                        |
| [**jobs**](/docs/appkit/v0/plugins/jobs)             | [Databricks Lakeflow Jobs](/docs/lakehouse/jobs) のトリガーと監視                                                                                                          |
| [**caching**](/docs/appkit/v0/plugins/caching)       | グローバルおよびプラグイン単位のレスポンスキャッシュ。利用可能な場合は [Lakebase Postgres](/docs/lakebase/quickstart) をバックエンドとして使用                                                             |

最新のプラグイン一覧については、[プラグインリファレンス](/docs/appkit/v0/plugins)を参照してください。

## 認証の仕組み \{#how-auth-works\}

各アプリには専用のサービスプリンシパルが割り当てられます。Databricks が実行時にその資格情報を注入するため、アプリはトークンを管理することなくワークスペースの API を呼び出せます。

デフォルトでは、すべてのリクエストがこのサービスプリンシパルとして実行され、すべてのユーザーがその権限を共有します。ユーザーごとにデータアクセスを制御したい場合は、Databricks がサインイン中のユーザーのトークンを `x-forwarded-access-token` 経由で転送できます。AppKit に組み込まれた [Genie](/docs/agents/genie) プラグインと [Model Serving](/docs/agents/ai-gateway) プラグインは、この処理を自動的に行います。

## 使いどころ \{#when-to-use-it\}

アプリの本質は、分析だけでなく**インタラクティブ性**にあります。ダッシュボードは、あらかじめ用意されたフィルターで参照するだけの用途に最適です。一方アプリは、それに加えて入力を受け付け、ロジックを実行し、結果を永続化できます。ワークフローにこうした要素のいずれかが必要な場合は、アプリを構築しましょう。たとえば、ユーザーが作成したケースを保存するシナリオビルダーや、手作業のスプレッドシート業務を置き換える社内ツールなどが挙げられます。

## 利用に適さないケース \{#when-not-to-use-it\}

- **Databricks のデータにアクセスしない静的サイト。** どこでホストしても構いません。
- **一般公開向け・顧客向けのアプリ。** 既定では、ユーザーは Databricks アカウント内の認証済み ID である必要があります（アプリのワークスペースに所属している必要はありません）。外部向けや顧客向けのアクセスについては、[App Users](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/key-concepts#app-users) を参照してください。
- AI/BI [ダッシュボード](https://docs.databricks.com/aws/en/dashboards/) でまかなえる**読み取り専用のダッシュボード**。ユーザー入力の永続化や独自ロジックの実行が必要になるまでは、ダッシュボードを使用してください。

## 次のステップ \{#where-to-next\}

[テンプレート](/templates)は、ユースケース別に整理されたエージェント対応のプロンプトです。目的に合うものを探すか、ステップバイステップの手順は [Apps クイックスタート](/docs/apps/quickstart) を参照してください。