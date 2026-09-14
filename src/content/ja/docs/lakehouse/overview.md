---
title: Data Lakehouse とは
sidebar_label: 概要
description: Databricks Data Intelligence Platform のデータ層。Lakeflow がデータを投入する、Unity Catalog で管理された分析用テーブル。AppKit アプリ向けの補足ドキュメント。
sourceOfTruth:
  skills:
    - databricks-dbsql
    - databricks-jobs
    - databricks-pipelines
  docs:
    - /docs/appkit/v0/plugins/analytics
    - /docs/appkit/v0/plugins/jobs
    - https://docs.databricks.com/aws/en/lakehouse/
---

# Data Lakehouseとは \{#what-is-the-data-lakehouse\}

Data Lakehouseは、Databricks workspaceの分析層にあたるもので、Unity Catalogで管理され、Lakeflowによってデータが投入されるテーブルとビューで構成されます。Lakeflowは、取り込み、オーケストレーション、パイプライン管理を網羅するDatabricksのデータエンジニアリングサービス群です。AppKitアプリからは、これらのテーブルの読み取り、Lakeflow Jobsのトリガー、テーブルにデータを投入したパイプラインの「最終更新」タイムスタンプの表示が行えます。

[Analytics プラグイン](/ja/docs/appkit/v0/plugins/analytics)はSQL warehouseからの読み取りを担当します ([分析的な読み取り](/ja/docs/lakehouse/analytical-reads)および[パイプラインとデータ鮮度](/ja/docs/lakehouse/pipelines)を参照) 。[Jobs プラグイン](/ja/docs/appkit/v0/plugins/jobs)は実行のトリガーと進捗の管理を担当します ([Lakeflow Jobs](/ja/docs/lakehouse/jobs)を参照) 。

## Data Lakehouse を使うべきケース \{#when-to-use-the-data-lakehouse\}

* 収益、顧客、イベント、モデル出力といったキュレーション済みの分析データを読み取る必要がある場合。
* 数百万行のデータに対するダッシュボード形式の集計やリストビューを表示する場合。
* ユーザー操作をきっかけに、モデルの再学習、ETL、長時間のバックフィルを非同期で実行する場合。

## 使うべきでない場面 \{#when-not-to-use-it\}

* **ユーザーリクエストに対するサブ秒の読み取り** (先行入力やオートコンプリートなど) 。[Lakebase Postgres](/ja/docs/lakebase/overview) を直接使うか、UC テーブルを同期テーブルとして Lakebase にレプリケートしてください。
* **アプリからのトランザクション書き込み** (注文、セッション、監査ログ) 。[Lakebase Postgres](/ja/docs/lakebase/overview) を使ってください。
* **ガバナンスされたテーブルに対する自然言語での質問応答**。[Genie](/ja/docs/agents/genie) を使ってください。

また、パイプラインの作成、Spark の設定、クラスターのサイジングも対象外です。これらは Databricks workspace 内、または [Declarative Automation Bundles](https://docs.databricks.com/aws/en/dev-tools/bundles/) を通じて行うデータエンジニアリングの作業です。

## 出発点となるテンプレートを選ぶ \{#pick-a-template-to-start-from\}

どのテンプレートも、上記のページで説明した構成をまとめ、そのまま動作するパターンに仕上げたものです。

| やりたいこと                                                          | テンプレート                                                        |
| --------------------------------------------------------------------- | ------------------------------------------------------------------- |
| UC テーブルを Lakebase に複製して低レイテンシーで読み取る             | [Sync Tables (Autoscaling)](/ja/templates/sync-tables-autoscaling)     |
| UC + Lakebase Change Data Feed + メダリオンパイプラインを一式構築する | [Operational Data Analytics](/ja/templates/operational-data-analytics) |

## 次のステップ \{#where-to-next\}

* [分析的な読み取り](/ja/docs/lakehouse/analytical-reads) — Analytics プラグイン、SQL ファイル、on-behalf-of-user クエリについて。
* [Lakeflow Jobs](/ja/docs/lakehouse/jobs) — Jobs プラグイン、`runNow`、SSE による進捗通知について。
* [パイプラインとデータ鮮度](/ja/docs/lakehouse/pipelines) — Analytics プラグインを利用した鮮度シグナルについて。