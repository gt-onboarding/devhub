---
title: Unity Catalog テーブルの読み取り
sidebar_label: 分析クエリの実行
description: Analytics pluginを使って、AppKit アプリからガバナンス管理された Unity Catalog テーブルを読み取ります。SQL ファイル、on-behalf-of-user クエリ、SQL ウェアハウスのリソースバインディングについて解説します。
sourceOfTruth:
  skills:
    - databricks-dbsql
    - databricks-unity-catalog
  docs:
    - /docs/appkit/v0/plugins/analytics
    - https://docs.databricks.com/aws/en/sql/
    - https://docs.databricks.com/aws/en/data-governance/unity-catalog/
---

# Unity Catalog テーブルの読み取り \{#read-unity-catalog-tables\}

AppKit アプリから Databricks のテーブルに対して分析クエリを実行するには、SQL warehouse（Databricks の SQL compute）が必要です。[Analytics plugin](/docs/appkit/v0/plugins/analytics) は、ハンドラーを SQL warehouse に接続します。SQL ファイルを `config/queries/` に配置すれば、warehouse がそれを実行し、型付きの行が返ってきます。ハンドラー側で権限をチェックする必要はありません。

warehouse がクエリするテーブルは Unity Catalog（UC）によって管理されます。UC は 3 階層の名前空間（`catalog.schema.object`）を管理し、アクセスのたびに権限付与、行フィルター、列マスク、ABAC（属性ベースのアクセス制御）ポリシーを適用します。UC が管理する対象はテーブルにとどまらず、ビュー、マテリアライズドビュー、ボリューム、モデル、ベクトル検索インデックス、登録済み関数にも及びます。

## 前提条件 \{#prerequisites\}

- [認証済みプロファイル](/docs/tools/databricks-cli#authenticate)を設定した Databricks CLI `v1.0.0+`。
- 実行中の AppKit アプリ。[Apps クイックスタート](/docs/apps/quickstart)を参照してください。
- `databricks.yml` でアプリリソースとして宣言された SQL warehouse。リソースをバインドすると、アプリの service principal に `CAN_USE` が自動的に付与されます。エンドユーザーの権限については[後述](#where-403s-come-from)を参照してください。

## Analytics pluginが読み取る対象 \{#what-the-analytics-plugin-reads\}

すべてのUCオブジェクトは `catalog.schema.object` という名前空間に属します。このプラグインがクエリするオブジェクトは次のとおりです。

- **テーブル**（DeltaおよびIceberg）
- **ビュー**および**マテリアライズドビュー**
- **ストリーミングテーブル**
- `SELECT my_catalog.my_schema.my_function(...)` の形式で呼び出す**関数**

その他のUCオブジェクトは、それぞれ別のプラグインで扱います。ボリューム（ファイルストレージ）は[Filesプラグイン](/docs/appkit/v0/plugins/files)を使用します。UCオブジェクトの全一覧は[セキュリティ保護可能なオブジェクト](https://docs.databricks.com/aws/en/data-governance/unity-catalog/securable-objects)を参照してください。

## Analytics plugin を組み込む \{#wire-the-analytics-plugin\}

`createApp` でプラグインを登録します。これにより Analytics のエンドポイントが公開され、`config/queries/` 内のクエリを読み込んで、`app.yaml` でバインドした SQL warehouse に対して実行します。

```typescript title="server/server.ts"
import { analytics, createApp, server } from "@databricks/appkit";

await createApp({
  plugins: [server(), analytics({})],
});
```

起動時にプラットフォームが `DATABRICKS_WAREHOUSE_ID` を設定できるよう、`app.yaml` で SQL warehouse をバインドします。

```yaml title="app.yaml"
env:
  - name: DATABRICKS_WAREHOUSE_ID
    valueFrom: sql-warehouse
```

対応するリソースは `databricks.yml` で定義します。リソースの全一覧と `valueFrom` キーについては、[アプリ構成](/docs/apps/configuration#resources)を参照してください。


## SQL ファイルを作成する \{#author-sql-files\}

`.sql` ファイルを `config/queries/` に配置します。拡張子 `.sql` を除いたファイル名がクエリキーになります。

```sql title="config/queries/spend_summary.sql"
-- @param startDate DATE
-- @param endDate DATE
SELECT date_trunc('day', usage_date) AS day, SUM(usage_quantity) AS qty
FROM system.billing.usage
WHERE usage_date BETWEEN :startDate AND :endDate
GROUP BY 1
ORDER BY 1;
```

実行コンテキストはファイル名によって決まります。

* `spend_summary.sql` は **アプリの service principal** として実行されます。キャッシュは全ユーザーで共有されます。
* `spend_summary.obo.sql` は **サインイン中のユーザー** として実行されます。キャッシュはユーザーごとに分かれます。Unity Catalog は、そのユーザーの権限、行フィルター、列マスク、ABAC ポリシーを適用します。

パラメータの型や Arrow ストリーミングを含むプラグイン API の全体像については、[Analytics plugin リファレンス](/docs/appkit/v0/plugins/analytics) を参照してください。


## `useAnalyticsQuery` で React にレンダリングする \{#render-in-react-with-useanalyticsquery\}

```tsx title="client/src/SpendTable.tsx"
import { useMemo } from "react";
import { sql } from "@databricks/appkit-ui/js";
import { useAnalyticsQuery } from "@databricks/appkit-ui/react";

export function SpendTable() {
  const params = useMemo(
    () => ({
      startDate: sql.date("2025-01-01"),
      endDate: sql.date("2025-12-31"),
    }),
    [],
  );

  const { data, loading, error } = useAnalyticsQuery("spend_summary", params);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;
  return (
    <ul>
      {data?.map((row) => (
        <li key={row.day}>
          {row.day}: {row.qty}
        </li>
      ))}
    </ul>
  );
}
```

:::important[パラメータは useMemo でラップする]
`useAnalyticsQuery` は、パラメータの参照が変わるたびに再フェッチします。インラインで記述したオブジェクトはレンダーのたびに新しい参照になるため、無限ループに陥ります。パラメータは `useMemo` でラップしてください。
:::


## 403 エラーの発生源 \{#where-403s-come-from\}

各クエリに紐づくアイデンティティは、ファイル名によって決まります。

- **service principal のクエリ**（`*.sql`）は、アプリの service principal を使用します。SP には対象テーブルに対する `SELECT` 権限が必要です。権限エラーが発生すると、ウェアハウスから `403` が返されます。
- **on-behalf-of-user のクエリ**（`*.obo.sql`）は、サインイン中のユーザーの ID を使用します。UC はそのユーザーに付与された権限を自動的に適用します。ユーザーに `SELECT` 権限がない場合や、行フィルターや列マスクでデータが隠されている場合は、呼び出しが `403` を返すか、返される行数が少なくなります。権限チェックを自分で実装する必要はありません。

:::note[on-behalf-of-user 認可の有効化が必要です]

アプリにスコープを追加するには、事前に workspace 管理者が on-behalf-of-user 認可を有効にしておく必要があります。プラットフォーム側の詳細については、[App authorization](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/auth) を参照してください。

:::

## Lakehouse Federation \{#lakehouse-federation\}

Lakehouse Federation は、外部ソース（Snowflake、BigQuery、Oracle、Redshift）を UC カタログとして見せる機能です。登録してしまえば、Analytics plugin から見ると他の UC テーブルと何ら変わりません。参照方法は同じ `catalog.schema.table` 形式で、SQL ファイルも OBO も同じです。ウェアハウスは可能な限りフィルタや集計を外部ソースへプッシュダウンし、残りのデータはクエリ実行時に読み取るため、UC に永続化されることはありません。対応ソースの一覧、セットアップ手順、ソースごとのプッシュダウン対応状況については [Lakehouse Federation](https://docs.databricks.com/aws/en/query-federation/) を参照してください。

## 自然言語クエリ \{#natural-language-queries\}

UC テーブルに対する自然言語での Q&A（キュレーション済みデータセット、ナレッジストア、質問を SQL に変換する複合 AI システムの組み合わせ）には、[Genie](/docs/agents/genie) を使用します。実際に動作する構成例は、[Genie Conversational Analytics](/templates/genie-conversational-analytics) テンプレートを参照してください。Genie プラグインは SQL 連携ではなくエージェント連携であるため、Agent Bricks のセクションに置かれています。

## 次のステップ \{#where-to-next\}

カタログをプロビジョニングするには [Set Up Unity Catalog with External Storage](/templates/unity-catalog-setup) を、アプリに UC ボリュームを追加するには [Volume File Manager](/templates/volume-file-upload) を試してください。さらに、処理の実行トリガーには [Lakeflow Jobs](/docs/lakehouse/jobs)、「最終更新」のシグナルには [Pipelines and freshness](/docs/lakehouse/pipelines) もご覧ください。