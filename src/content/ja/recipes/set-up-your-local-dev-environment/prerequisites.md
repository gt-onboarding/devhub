このテンプレートは、開発者のマシン上の Databricks CLI を実際のワークスペースに接続します。これは DevHub の他のすべてのテンプレートに共通する必須の前提条件です。これが完了すれば、`databricks` コマンドが実際のワークスペースに解決され、どの DevHub プロンプトも最初から最後まで実行できるようになります。

* **サインインできる Databricks ワークスペース。** ワークスペースの URL (例: `https://<workspace>.cloud.databricks.com`) を手元に用意してください。ステップ 3 の `databricks auth login` で貼り付けて使用します。アクセス権がない場合は、ワークスペース管理者に問い合わせてください。
* **macOS、Windows、または Linux のターミナル。** インストール手順はいずれもターミナルセッションから実行します。Windows で curl を使う場合は WSL を推奨します。`winget` は PowerShell と cmd のどちらでも動作します。
* **このマシンにソフトウェアをインストールする権限。** CLI は `/usr/local/bin` (Homebrew / curl) または `%LOCALAPPDATA%` (WinGet) にインストールされます。`/usr/local/bin` に書き込めない場合は、curl インストーラーを `sudo` で再実行してください。