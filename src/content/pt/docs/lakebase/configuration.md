---
title: Configuração do Lakebase Postgres
sidebar_label: Configuração
sourceOfTruth:
  skills:
    - databricks-lakebase
  docs:
    - /docs/appkit/v0/plugins/lakebase
    - https://docs.databricks.com/aws/en/oltp/projects/manage-projects
---

# Configuração do Lakebase Postgres \{#lakebase-postgres-configuration\}

O AppKit se conecta ao Lakebase Postgres por meio de um recurso `postgres` declarado no `databricks.yml` e da variável `LAKEBASE_ENDPOINT` definida no `app.yaml`.

Esta página trata da configuração no AppKit. Para saber mais sobre o Lakebase em si (projetos, branches, autoscaling, escala a zero), consulte a [documentação do Lakebase](https://docs.databricks.com/aws/en/oltp/) ou a agent skill [`databricks-lakebase`](/docs/tools/ai-tools/agent-skills).

## Valores de conexão \{#connection-values\}

O Databricks Apps injeta a maioria dos valores de conexão na inicialização. `LAKEBASE_ENDPOINT` é a exceção: ele é declarado no `app.yaml` por meio de `valueFrom: postgres` e resolvido na inicialização a partir do recurso `postgres`:

```yaml
env:
  - name: LAKEBASE_ENDPOINT
    valueFrom: postgres
```

| Variável            | Descrição                                                                  | Origem                                           |
| ------------------- | -------------------------------------------------------------------------- | ------------------------------------------------ |
| `LAKEBASE_ENDPOINT` | Caminho do recurso de endpoint (`projects/.../branches/.../endpoints/...`) | Definido por `valueFrom: postgres` no `app.yaml` |
| `PGHOST`            | Host do Lakebase Postgres                                                  | Injetado automaticamente pela plataforma         |
| `PGDATABASE`        | Nome do banco de dados PostgreSQL                                          | Injetado automaticamente pela plataforma         |
| `PGSSLMODE`         | Modo TLS (`require`)                                                       | Injetado automaticamente pela plataforma         |
| `PGPORT`            | Porta (5432)                                                               | Injetado automaticamente pela plataforma         |

No desenvolvimento local, esses valores vêm do seu arquivo `.env`. A seção [Configuração local](/docs/lakebase/development#local-setup) explica como preenchê-los.


## Manifesto de plugins \{#plugin-manifest\}

Ao registrar o plugin `lakebase()` em `createApp`, o AppKit gera o arquivo `appkit.plugins.json`, que declara os recursos exigidos pelo plugin. Execute `npx @databricks/appkit plugin sync --write` para regenerá-lo após adicionar ou alterar plugins:

```bash
npx @databricks/appkit plugin sync --write
```

Isso é executado automaticamente durante `npm run dev` e `npm run build`. Faça o commit do arquivo junto com seu código.

A referência de [configuração do AppKit](/docs/appkit/v0/configuration) detalha as vinculações de recursos de plugins no `app.yaml`.


## Hierarquia de recursos \{#resource-hierarchy\}

O Lakebase Postgres organiza os recursos em **projetos** que contêm **branches**, e cada branch contém **computes** e **bancos de dados**.

```text
projects/{project_id}
  └── branches/{branch_id}
        ├── endpoints/{endpoint_id}   (compute)
        └── databases/{database_id}
```

* **Project**: contêiner de nível superior. Criado com `databricks postgres create-project`.
* **Branch**: ambiente de banco de dados isolado. Novos projetos recebem um branch `production` padrão com um banco de dados `databricks_postgres`.
* **Compute**: fornece capacidade de processamento e memória para um branch. Cada branch recebe automaticamente um compute `primary` de leitura e escrita. Réplicas somente leitura podem ser adicionadas para escalar as leituras.
* **Database**: um banco de dados PostgreSQL dentro de um branch. Liste com `databricks postgres list-databases <branch>`.

A CLI e a API se referem aos computes como **endpoints** (`ENDPOINT_TYPE_READ_WRITE` para leitura e escrita, `ENDPOINT_TYPE_READ_ONLY` para réplicas de leitura). Os comandos e caminhos de recursos deste documento usam esse termo.

A [referência da CLI `postgres`](https://docs.databricks.com/aws/en/oltp/projects/cli) abrange todos os comandos `databricks postgres`.


## Branching \{#branching\}

As branches criam ambientes de banco de dados isolados. Ao criar uma branch, o Lakebase Postgres copia o esquema e os dados da branch de origem por meio de copy-on-write. A criação de novas branches é instantânea e você paga apenas pelos dados que alterar.

Cada nova branch recebe um endpoint de leitura e escrita `primary` em `projects/{project_id}/branches/{branch_id}/endpoints/primary`, que herda as `default_endpoint_settings` do projeto. Use `create-endpoint` para adicionar réplicas de leitura (`ENDPOINT_TYPE_READ_ONLY`).

As branches exigem uma política de expiração (`ttl`, `expire_time` ou `no_expiry: true`). Consulte [Expiração de branch](https://docs.databricks.com/aws/en/oltp/projects/manage-branches#expiration) para ver todas as opções. Para comandos da CLI, veja os exemplos em [Feature branches](/docs/lakebase/development#feature-branches).

:::note
Os IDs de projeto, branch, endpoint e banco de dados devem ter de 1 a 63 caracteres, começar com uma letra minúscula e conter apenas letras minúsculas, números e hifens.
:::

## Autoscaling \{#autoscaling\}

Os computes escalam automaticamente entre um mínimo e um máximo de unidades de compute (CU) configurados. Você define o intervalo por projeto ou por endpoint. Os valores padrão de CU, o tamanho máximo de compute e a restrição de mín./máx. são configurações do Lakebase que mudam ao longo do tempo, portanto consulte [Autoscaling](https://docs.databricks.com/aws/en/oltp/projects/autoscaling) para ver os valores atuais.

O escalonamento dentro do intervalo configurado ocorre sem interrupção das conexões. Alterar o mínimo ou o máximo pode causar uma breve interrupção.

<details>
<summary>Configurar autoscaling</summary>

```bash title="Common"
databricks postgres update-endpoint \
  projects/my-project/branches/production/endpoints/primary \
  "spec.autoscaling_limit_min_cu,spec.autoscaling_limit_max_cu" \
  --json '{"spec": {"autoscaling_limit_min_cu": 1.0, "autoscaling_limit_max_cu": 8.0}}'
```

```bash title="All Options"
databricks postgres update-endpoint \
  projects/$PROJECT_ID/branches/$BRANCH_ID/endpoints/$ENDPOINT_ID \
  $UPDATE_MASK \
  --json '{"spec": {
    "autoscaling_limit_min_cu": 1.0,
    "autoscaling_limit_max_cu": 8.0
  }}' \
  --no-wait \
  --timeout 10m \
  --debug \
  -o json \
  --target $TARGET \
  --profile $DATABRICKS_PROFILE
```

<!-- cli-options:postgres update-endpoint -->

| Opção             | Descrição                                                                                          |
| ----------------- | -------------------------------------------------------------------------------------------------- |
| `--json`          | string JSON inline ou @caminho/para/arquivo.json com o corpo da requisição (padrão JSON (0 bytes)) |
| `--no-wait`       | não aguardar até atingir o estado DONE                                                             |
| `--timeout`       | tempo máximo para atingir o estado DONE                                                            |
| `--debug`         | habilita o log de depuração                                                                        |
| `--output`, `-o`  | tipo de saída: text ou json (padrão text)                                                          |
| `--profile`, `-p` | perfil do ~/.databrickscfg                                                                         |
| `--target`, `-t`  | target do bundle a ser usado (se aplicável)                                                        |

<!-- /cli-options -->

</details>


## Escala para zero \{#scale-to-zero\}

O [escala para zero](https://docs.databricks.com/aws/en/oltp/projects/scale-to-zero) suspende computes ociosos para eliminar custos. Quando chega uma nova consulta, o compute é retomado automaticamente (normalmente em algumas centenas de milissegundos).

O tempo limite padrão é de 24 horas. Defina qualquer valor entre 60 segundos e 7 dias. Em branches de desenvolvimento, tempos limite mais curtos (30 minutos, por exemplo) reduzem ainda mais os custos. Aplicativos conectados a um compute suspenso terão uma breve pausa na primeira consulta. Implemente lógica de repetição de conexão no seu aplicativo.

Quando um compute é retomado, o contexto da sessão é reiniciado (tabelas temporárias, instruções preparadas, configurações de sessão, pools de conexões).

<details>
<summary>Configurar escala para zero</summary>

Os valores `300s` abaixo são tempos limite personalizados usados como exemplo, não o padrão (o padrão é 24 horas). Defina qualquer valor entre 60 segundos e 7 dias.

**Padrões do projeto** (novas branches herdam essas configurações):

```bash title="Common"
databricks postgres update-project \
  projects/my-project \
  "spec.default_endpoint_settings" \
  --json '{"spec": {"default_endpoint_settings": {"suspend_timeout_duration": "300s"}}}'
```

```bash title="All Options"
databricks postgres update-project \
  projects/$PROJECT_ID \
  $UPDATE_MASK \
  --json '{
    "spec": {
      "default_endpoint_settings": {
        "autoscaling_limit_min_cu": 0.5,
        "autoscaling_limit_max_cu": 1.0,
        "suspend_timeout_duration": "300s"
      }
    }
  }' \
  --no-wait \
  --timeout 10m \
  --debug \
  -o json \
  --target $TARGET \
  --profile $DATABRICKS_PROFILE
```

<!-- cli-options:postgres update-project -->

| Opção             | Descrição                                                                                          |
| ----------------- | -------------------------------------------------------------------------------------------------- |
| `--json`          | string JSON inline ou @caminho/para/arquivo.json com o corpo da requisição (padrão JSON (0 bytes)) |
| `--no-wait`       | não aguardar até atingir o estado DONE                                                             |
| `--timeout`       | tempo máximo para atingir o estado DONE                                                            |
| `--debug`         | habilitar log de depuração                                                                         |
| `--output`, `-o`  | tipo de saída: text ou json (padrão text)                                                          |
| `--profile`, `-p` | perfil de ~/.databrickscfg                                                                         |
| `--target`, `-t`  | target do bundle a ser usado (se aplicável)                                                        |

<!-- /cli-options -->

**Por endpoint** (alterar ou desativar em um endpoint existente):

Use `spec.suspension` como máscara de atualização para todas as alterações de suspensão em `update-endpoint`.

```bash title="Change timeout"
databricks postgres update-endpoint \
  projects/my-project/branches/production/endpoints/primary \
  "spec.suspension" \
  --json '{"spec": {"suspend_timeout_duration": "300s"}}'
```

```bash title="Disable scale to zero"
databricks postgres update-endpoint \
  projects/my-project/branches/production/endpoints/primary \
  "spec.suspension" \
  --json '{"spec": {"no_suspension": true}}'
```

:::note
Definir `no_suspension: false` não é suportado e retorna um erro. Para reativar o escala para zero após desativá-lo, defina `suspend_timeout_duration`.
:::

</details>


## Próximos passos \{#where-to-next\}

Consulte [Desenvolvimento com Lakebase Postgres](/docs/lakebase/development) para configuração local, feature branches e a API completa do plugin, ou explore o [catálogo de templates](/templates) para conferir padrões completos.