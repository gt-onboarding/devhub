---
title: Início rápido
sourceOfTruth:
  skills:
    - databricks-apps
    - databricks-lakebase
  docs:
    - /docs/appkit/v0
    - https://docs.databricks.com/aws/en/oltp/
---

# Início rápido \{#quickstart\}

## Pré-requisitos \{#prerequisites\}

* Databricks CLI `v1.0.0+` com um [perfil autenticado](/pt/docs/tools/databricks-cli#authenticate)
* `psql` (cliente PostgreSQL), caso use `databricks psql`. Como alternativa, use [`generate-database-credential`](/pt/docs/lakebase/development#local-database-access) com qualquer cliente PostgreSQL.
* Workspace com acesso ao Lakebase Postgres habilitado

## Caminho do template \{#template-path\}

Explore os templates abaixo, escolha um para o seu caso de uso e copie-o para o seu assistente de programação com IA. Cada um inclui o recurso [Criar um projeto Lakebase](/pt/templates/lakebase-create-instance), que orienta a criação do projeto e a coleta dos valores de conexão.

| Template                                                                     | Ideal para                                                     |
| ---------------------------------------------------------------------------- | -------------------------------------------------------------- |
| [App com Lakebase](/pt/templates/app-with-lakebase)                             | Apps CRUD com armazenamento persistente                        |
| [App de chat com IA](/pt/templates/ai-chat-app)                                 | IA conversacional com histórico de chat                        |
| [Análise de dados operacionais](/pt/templates/operational-data-analytics)       | Sincronização bidirecional entre Lakebase Postgres e Unity Catalog |

## Personalize seu app \{#customize-your-app\}

Depois de implantar um app com Lakebase Postgres, considere as seguintes personalizações:

* **Adicionar tabelas**: siga o template [Lakebase Data Persistence](/pt/templates/lakebase-data-persistence) para definir esquemas, gerar tipos e criar rotas CRUD.
* **Adicionar memória ao agente**: use o template [Lakebase Agent Memory](/pt/templates/lakebase-agent-memory) para persistir as conversas de chat do seu agente.
* **Usar feature branches**: crie branches isoladas para desenvolvimento e testes. A seção [Desenvolvimento: Feature branches](/pt/docs/lakebase/development#feature-branches) traz os comandos da CLI.
* **Sincronizar dados com o Unity Catalog**: use o [Lakebase Change Data Feed (CDF)](/pt/templates/lakebase-change-data-feed-autoscaling) para replicar tabelas do Lakebase Postgres no Delta, ou as [Sync Tables](/pt/templates/sync-tables-autoscaling) para disponibilizar dados do Unity Catalog por meio dele.
* **Implantar fora do Databricks**: use o template [Lakebase Off-Platform](/pt/templates/lakebase-off-platform) para apps hospedados na AWS, Vercel, Netlify e outros.

## Caminho manual \{#manual-path\}

Quando você cria a estrutura do projeto sem um template, o `databricks apps init` gera um projeto AppKit funcional. Antes, você precisa de um projeto Lakebase. Crie um:

```bash
databricks postgres create-project <project-id>
```

O ID passa a ser o nome do recurso do projeto (`projects/<project-id>`). Para uma configuração guiada, incluindo branches e valores de conexão, consulte o template [Criar um projeto Lakebase](/pt/templates/lakebase-create-instance) ou a agent skill [`databricks-lakebase`](/pt/docs/tools/ai-tools/agent-skills).

**Interativo** (recomendado para desenvolvimento local): execute sem flags.

```bash
databricks apps init
```

A CLI solicita o nome do seu app e, em seguida, lista os plugins (recursos) disponíveis. Selecione **Lakebase** e ela guiará você na escolha de um projeto Lakebase existente, de uma branch e de um banco de dados.

**Modo não interativo** (para scripts e CI): passe `--name` e os campos `--set` obrigatórios de cada recurso de plugin selecionado. O valor de `database` deve ser o caminho completo do recurso, obtido com `databricks postgres list-databases projects/<project-id>/branches/<branch-id> -o json` (use o campo `name`):

```bash
databricks apps init --name my-app --features lakebase \
  --set lakebase.postgres.project=projects/<project-id> \
  --set lakebase.postgres.branch=projects/<project-id>/branches/<branch-id> \
  --set lakebase.postgres.database=projects/<project-id>/branches/<branch-id>/databases/<database-id>
```

Em seguida, faça primeiro o deploy para criar os schemas e depois execute localmente:

```bash
cd my-app
databricks apps deploy
```

:::tip
Execute `databricks apps deploy` antes de `npm run dev`. A implantação configura uma identidade gerenciada (o service principal do app) que cria o schema do banco de dados na primeira inicialização. Se você rodar `npm run dev` primeiro, o schema será criado com suas credenciais pessoais e, quando você implantar depois, a identidade gerenciada do app não conseguirá acessá-lo. Veja mais detalhes em [Configuração local](/pt/docs/lakebase/development#local-setup).
:::

```bash
npm install && npm run dev
```

## Próximos passos \{#where-to-next\}

Para conhecer o fluxo de trabalho de desenvolvimento local, as feature branches e a API completa do plugin, consulte [Desenvolvimento com Lakebase Postgres](/pt/docs/lakebase/development).