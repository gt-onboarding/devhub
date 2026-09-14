Este modelo demonstra um aplicativo de chat com Retrieval-Augmented Generation construído no Databricks: a pergunta do usuário é convertida em embedding, documentos semelhantes são recuperados de um repositório pgvector no Lakebase Postgres e o contexto recuperado é injetado em uma chamada de Model Serving que retorna a resposta em streaming. As conversas e as fontes são persistidas por chat no Lakebase.

### Fluxo de dados \{#data-flow\}

Todo o estado de recuperação e de chat reside no Lakebase Postgres; a geração usa o Model Serving:

1. **A carga inicial** busca alguns artigos da Wikipédia na inicialização, divide-os em blocos por parágrafo, gera os embeddings de cada bloco por meio do endpoint de embeddings de modelos de fundação (`databricks-gte-large-en` por padrão) e grava as linhas em `rag.documents` com uma coluna `vector(1024)`.
2. **Os turnos do usuário** são convertidos em embeddings pelo mesmo endpoint. O servidor executa uma busca por similaridade de cosseno com pgvector para recuperar os top-k blocos correspondentes.
3. **Injeção de contexto**: os blocos recuperados são inseridos no início como uma mensagem de sistema, antes que o histórico de conversa do usuário seja enviado ao endpoint de chat completion (`databricks-gpt-5-4-mini` por padrão) via Model Serving.
4. **Streaming**: o `streamText` transmite os tokens de volta ao cliente enquanto um callback `onFinish` acrescenta o turno do assistente ao Lakebase.
5. **Histórico de chat**: cada turno do usuário e do assistente é persistido em `chat.messages`, com chave `chat_id`, permitindo retomar as conversas.

### Abordagem do modelo \{#template-approach\}

Diferentemente dos outros modelos, **este modelo foi projetado para ser consumido via `databricks apps init`**, e não `git clone`. O fluxo de init:

* Solicita os nomes da branch do Lakebase Postgres e do recurso de banco de dados.
* Resolve automaticamente `PGHOST`, `PGDATABASE` e `LAKEBASE_ENDPOINT` no seu `.env` local, chamando as APIs do Lakebase.
* Grava `DATABRICKS_CONFIG_PROFILE` ou `DATABRICKS_HOST` com base na sua configuração do Databricks CLI.
* Leva você direto a um diretório de projeto pronto para execução, com o nome definido por `--name`.

Isso valida o [sistema de modelos do AppKit](/docs/appkit/v0/development/templates) como uma forma de distribuir modelos do DevHub — veja `appkit.plugins.json` e `.env.tmpl` no modelo para entender como funciona.

### O que adaptar \{#what-to-adapt\}

A configuração e o provisionamento estão documentados no **`README.md`** do repositório.

Para adaptar este modelo às suas necessidades:

* **Lakebase**: aponte o bundle para o seu próprio projeto, branch e banco de dados Lakebase (solicitados no momento da inicialização).
* **Model Serving endpoint**: sobrescreva `DATABRICKS_ENDPOINT` para usar outro modelo de chat (por exemplo, `databricks-claude-sonnet-4-6`).
* **Endpoint de embeddings**: sobrescreva `DATABRICKS_EMBEDDING_ENDPOINT` se quiser usar outro modelo de embedding. Verifique se a dimensão `vector(N)` em `server/lib/rag-store.ts` corresponde.
* **Dados de seed**: substitua a lista de artigos da Wikipédia em `server/lib/seed-data.ts` pelo seu próprio corpus. A função de chunking divide o texto nos limites de parágrafo — adapte-a se a sua fonte tiver outra estrutura.
* **Recuperação**: o top-k padrão é 5 e a métrica de similaridade é o cosseno. Ajuste em `retrieveSimilar()`.