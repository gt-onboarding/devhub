---
title: Lakeflow パイプラインとデータの鮮度
sidebar_label: パイプラインとデータの鮮度
description: AppKit アプリで「このデータは最新か?」を示すタイムスタンプを表示します。Analytics プラグインを通じて、テーブルごとのrefresh メタデータとpipelineの更新タイムラインを取得します。
sourceOfTruth:
  skills:
    - databricks-pipelines
  docs:
    - /docs/appkit/v0/plugins/analytics
    - https://docs.databricks.com/aws/en/ldp/
---

# Lakeflow パイプラインとデータの鮮度 \{#lakeflow-pipelines-and-data-freshness\}

Lakeflow Spark Declarative Pipelines（SDP）は、アプリが読み取る分析テーブルにデータを投入します。pipelineの作成はデータエンジニアリング側の作業で、AppKit 開発者がこれに関わることはほとんどありません。開発者が担当するのは読み取り側、つまりpipelineの出力を表示することと、レンダリング前に「これは表示するのに十分新しいか？」を判断することです。

その判断材料になるのが SQL のシグナルです。具体的には、materialized views とストリーミングテーブルのテーブル単位の refresh メタデータ、そして pipeline update timeline です。いずれも、[Analytical reads](/docs/lakehouse/analytical-reads) でセットアップした [Analytics プラグイン](/docs/appkit/v0/plugins/analytics) 経由で取得します。

Lakeflow は Databricks のデータエンジニアリングスイートです。AppKit 開発者が扱うのはpipeline出力の読み取りだけですが、構成要素を把握しておくと役立ちます。

- **Lakeflow Connect**: 取り込み用。マネージドコネクタが Unity Catalog にデータを配置します。
- **Lakeflow Spark Declarative Pipelines**: 変換用。SQL または Python で記述し、materialized views とストリーミングテーブルを生成します。
- **Lakeflow Jobs**: オーケストレーション用。アプリからのトリガーについては [Lakeflow Jobs](/docs/lakehouse/jobs) を参照してください。
- **Lakeflow Designer**: ノーコードでpipelineを視覚的に構築するためのもの。

製品ファミリー全体については [Lakeflow のドキュメント](https://docs.databricks.com/aws/en/ldp/) を参照してください。

## 鮮度シグナル \{#freshness-signals\}

- **テーブル単位の refresh メタデータ**: `DESCRIBE TABLE EXTENDED <name> AS JSON` は、materialized views およびストリーミングテーブルについて `refresh_information` ブロックを返します。このブロックには `last_refreshed_at`、`last_refresh_type`、`latest_refresh_status`、`latest_refresh_link`、`refresh_schedule` が含まれます。出力スキーマの全体は [DESCRIBE TABLE](https://docs.databricks.com/aws/en/sql/language-manual/sql-ref-syntax-aux-describe-table) を参照してください。
- **pipeline update timeline**: `system.lakeflow.pipeline_update_timeline` は、すべての pipeline の更新を `pipeline_id`、`update_id`、`period_start_time`、`period_end_time`、`result_state`（`COMPLETED`、`FAILED`、`CANCELED` のいずれか）、およびトリガーの詳細とともに記録します。`pipeline_id` と `result_state = 'COMPLETED'` でフィルタすれば、対象テーブルを所有する pipeline で直近に成功した更新を特定できます。列の一覧は [システムテーブルリファレンス](https://docs.databricks.com/aws/en/admin/system-tables/jobs#pipeline-update-timeline) を参照してください。

さらに踏み込んだトラブルシューティング（フロー単位のステータス、エクスペクテーションの結果、リネージイベント）には、`event_log()` テーブル値関数を介して [pipeline イベントログ](https://docs.databricks.com/aws/en/ldp/monitor-event-logs) を使用します。イベントログは「この更新はなぜ失敗したのか」を調べるためのものであり、「このデータは表示できるほど新しいか」を判断するためのものではありません。

## 「最終更新」バッジ用のクエリ \{#a-last-updated-badge-query\}

これを `config/queries/` に配置します。他の SQL ファイルと同様に、Analytics プラグイン経由で実行されます。

```sql title="config/queries/last_pipeline_update.obo.sql"
-- @param pipelineId STRING
SELECT period_end_time, result_state
FROM system.lakeflow.pipeline_update_timeline
WHERE pipeline_id = :pipelineId
  AND result_state = 'COMPLETED'
ORDER BY period_end_time DESC
LIMIT 1;
```

React から pipeline ID を指定してフックを呼び出します。

```tsx
import { useMemo } from "react";
import { sql } from "@databricks/appkit-ui/js";
import { useAnalyticsQuery } from "@databricks/appkit-ui/react";

const params = useMemo(
  () => ({ pipelineId: sql.string("ec2a0ff4-d2a5-4c8c-bf1d-d9f12f10e749") }),
  [],
);
const { data } = useAnalyticsQuery("last_pipeline_update", params);
```

`.obo.sql` というファイル名にすると、クエリはサインイン中のユーザーとして実行されます。アプリのサービスプリンシパルが `system.lakeflow.pipeline_update_timeline` に対する `SELECT` 権限を持っている場合は、`.obo` を外せばアプリとして実行されます。ファイル名のルールの詳細は [SQL ファイルの作成](/docs/lakehouse/analytical-reads#author-sql-files) を参照してください。

## アプリから refresh をトリガーする \{#triggering-a-refresh-from-the-app\}

専用の AppKit Pipelines プラグインはありません。ハンドラーから `w.pipelines.startUpdate({ pipelineId })` で SDK を直接呼び出すか、pipeline を [Lakeflow Jobs](/docs/lakehouse/jobs) でラップして Jobs プラグインを使用してください。

## 次のステップ \{#where-to-next\}

これらのテーブルを生成する標準的な SDP pipelineについては [CDC 履歴テーブルからのメダリオンアーキテクチャ](/templates/medallion-architecture-from-cdc) を、UC + CDC + メダリオンのエンドツーエンドパターンについては [運用データ分析](/templates/operational-data-analytics) をお試しください。