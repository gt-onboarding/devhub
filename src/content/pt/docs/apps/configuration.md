---
title: Configuração do app
sidebar_label: Configuração
sourceOfTruth:
  skills:
    - databricks-apps
  docs:
    - /docs/appkit/v0/configuration
    - https://docs.databricks.com/aws/en/dev-tools/databricks-apps/
---

# Configuração do app \{#app-configuration\}

Dois arquivos controlam como seu app AppKit é iniciado e a que ele se conecta: `app.yaml` (comportamento de runtime e variáveis de ambiente) e `databricks.yml` (recursos do Databricks). Cada app recebe uma URL fixa no momento da criação, que não pode ser alterada.

:::tip[Desenvolvendo com Python?]

O AppKit foi feito para TypeScript no Node.js. O desenvolvimento de apps em Python não é abordado neste site. Consulte a [documentação do Databricks Apps](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/) para frameworks Python (Gradio, Streamlit, Dash).

:::

## Arquivos de configuração \{#configuration-files\}

O **`app.yaml`** controla o comportamento em runtime (comando de inicialização e variáveis de ambiente):

```yaml
command: ["npm", "run", "start"]
env:
  - name: LAKEBASE_ENDPOINT
    valueFrom: postgres
  - name: WAREHOUSE_ID
    valueFrom: sql-warehouse
```

O `command` é uma sequência (array), e não uma string de shell. Não há suporte para expansão de variáveis de ambiente em `command`, exceto para `DATABRICKS_APP_PORT`.

**`databricks.yml`** declara os recursos, as variáveis e os destinos de implantação do Databricks:

```yaml
resources:
  apps:
    my-app:
      resources:
        - name: postgres
          postgres:
            branch: ${var.postgres_branch}
            database: ${var.postgres_database}
            permission: CAN_CONNECT_AND_CREATE
```

Variáveis como `${var.postgres_branch}` são resolvidas a partir da seção `variables` do `databricks.yml` ou de flags da CLI no momento do deploy.

Para a referência completa do `app.yaml` específico do AppKit, incluindo vinculações de recursos de plugins, consulte [Configuração do AppKit](/pt/docs/appkit/v0/configuration).

## Manifesto de plugins \{#plugin-manifest\}

Cada app do AppKit possui um `appkit.plugins.json` que declara quais plugins estão ativos e quais recursos do Databricks eles exigem. Esse arquivo é gerado automaticamente ao executar:

```bash
npx @databricks/appkit plugin sync --write
```

Isso é executado automaticamente durante `npm run dev` e `npm run build`. Faça o commit dele junto com o seu código. A CLI e o pipeline de implantação o utilizam para provisionar recursos.

## Recursos \{#resources\}

Os apps acessam serviços do Databricks por meio de recursos declarados. Cada recurso tem um `name` em `databricks.yml`. Use esse nome como o valor de `valueFrom` no `app.yaml`.

Os templates do AppKit usam nomes convencionais para recursos gerenciados por plugins:

| Recurso                                                                       | Nome do recurso    | O que fornece                       |
| ----------------------------------------------------------------------------- | ------------------ | ----------------------------- |
| [Lakebase Postgres](/pt/docs/lakebase/quickstart)                                | `postgres`         | Conexão com o PostgreSQL         |
| [SQL Warehouse](https://docs.databricks.com/aws/en/compute/sql-warehouse/)    | `sql-warehouse`    | Execução de consultas SQL           |
| [Model Serving](/pt/docs/agents/ai-gateway)                                      | `serving-endpoint` | Inferência de modelos de IA            |
| [Genie Agent](/pt/docs/agents/genie)                                             | `genie-space`      | Consultas a dados em linguagem natural |
| [Job](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/resources) | `job`              | Job agendado ou acionado    |
| [UC Volumes](https://docs.databricks.com/aws/en/files/)                       | `volume`           | Armazenamento de arquivos                  |

Outros tipos de recursos (tabelas do Unity Catalog, conexões, índices do AI Search (antigo Vector Search), experimentos do MLflow, entre outros) estão listados na [documentação oficial de recursos](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/resources).

### Secrets \{#secrets\}

Nenhum dos arquivos de configuração contém o valor do secret. O `databricks.yml` declara um recurso que aponta para um [secret scope](https://docs.databricks.com/aws/en/security/secrets) e uma chave definidos por você, e o `app.yaml` referencia esse recurso pelo nome. A plataforma injeta o valor descriptografado em runtime.

1. Armazene o valor do secret com a Databricks CLI:

   ```bash
   databricks secrets create-scope my-app-secrets
   databricks secrets put-secret my-app-secrets MY_SECRET --string-value "..."
   ```

2. Declare o recurso de secret no `databricks.yml`:

   ```yaml
   resources:
     apps:
       my-app:
         resources:
           - name: my-secret # rótulo deste recurso (definido pelo usuário)
             secret:
               scope: my-app-secrets # nome do secret scope do Databricks
               key: MY_SECRET # chave dentro desse scope
               permission: READ
   ```

3. Vincule-o a uma variável de ambiente no `app.yaml`:

   ```yaml
   env:
     - name: MY_SECRET
       valueFrom: my-secret # referencia o nome do recurso acima, não o valor do secret
   ```

Em runtime, `MY_SECRET` contém o valor descriptografado do secret. Nenhum dos dois arquivos contém o valor em si.

## Variáveis de ambiente \{#environment-variables\}

A plataforma injeta estas variáveis automaticamente em runtime:

| Variável                   | Descrição                              |
| -------------------------- | -------------------------------------- |
| `DATABRICKS_HOST`          | URL do workspace                       |
| `DATABRICKS_APP_PORT`      | Porta em que o app deve escutar        |
| `DATABRICKS_APP_NAME`      | Nome do app                            |
| `DATABRICKS_CLIENT_ID`     | Client ID do service principal         |
| `DATABRICKS_CLIENT_SECRET` | Client secret do service principal     |
| `DATABRICKS_WORKSPACE_ID`  | ID do workspace                        |

Variáveis personalizadas ficam no `app.yaml`, em `env`. Use `value` para texto simples e `valueFrom` para [nomes de recursos](#resources). Nunca coloque secrets em `value`.

## Modelo de autenticação \{#auth-model\}

Cada app recebe um service principal dedicado. O Databricks injeta `DATABRICKS_CLIENT_ID` e `DATABRICKS_CLIENT_SECRET` automaticamente em runtime e exclui o service principal quando o app é excluído.

A **autorização de usuário** (Public Preview) encaminha o token do usuário autenticado pelo cabeçalho HTTP `x-forwarded-access-token`. Os escopos (por exemplo, `sql`, `genie`, `files`) são configurados na interface do workspace. Os plugins nativos do AppKit para [Genie](/pt/docs/agents/genie) e [Model Serving](/pt/docs/agents/ai-gateway) já usam esse mecanismo automaticamente. Consulte [contexto de execução](/pt/docs/appkit/v0/plugins/execution-context) para ver a implementação no AppKit ou [autorização de apps](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/auth) para os detalhes completos da plataforma.

## Compute \{#compute\}

Os tamanhos de compute são `MEDIUM` (padrão), `LARGE` e `XLARGE` (a disponibilidade varia conforme o workspace). Defina o tamanho na interface do workspace ou pela flag `--compute-size` nos comandos `databricks apps create` e `databricks apps update`. Consulte a [documentação do Databricks Apps](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/) para ver os valores de vCPU, RAM e DBU de cada tamanho.

## Restrições \{#constraints\}

* Sem sistema de arquivos durável (use [Lakebase Postgres](/pt/docs/lakebase/quickstart), DBSQL ou UC Volumes para persistência)
* Arquivos maiores que 10 MB fazem a implantação falhar
* O SIGTERM dá 15 segundos antes do SIGKILL
* Runtime: Ubuntu 22.04, Node 22, Python 3.11

Consulte [Boas práticas](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/best-practices) para orientações sobre tratamento de encerramento, boas práticas com secrets e rede.

## Status do app \{#app-statuses\}

| Status    | Significado                                |
| --------- | ------------------------------------------ |
| Running   | O app está íntegro e atendendo ao tráfego  |
| Deploying | Uma nova implantação está em andamento     |
| Crashed   | O app falhou ao iniciar ou foi encerrado   |
| Stopped   | O app foi parado manualmente               |

## Próximos passos \{#where-to-next\}

Consulte [Desenvolvimento de apps](/pt/docs/apps/development) para configuração local, flags de deploy e a API completa de plugins, ou explore o [catálogo de templates](/pt/templates) para ver padrões completos.