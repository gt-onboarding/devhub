---
title: Desenvolvimento de apps
sidebar_label: Desenvolvimento
sourceOfTruth:
  skills:
    - databricks-apps
  docs:
    - /docs/appkit/v0
    - https://docs.databricks.com/aws/en/dev-tools/databricks-apps/
---

# Desenvolvimento de apps \{#app-development\}

Esta página é a referência de CLI e de fluxos de trabalho para Databricks Apps e AppKit. Ela cobre como adicionar plugins, gerar a estrutura inicial, implantar, gerenciar e solucionar problemas do seu app.

Cada comando abaixo mostra uma invocação comum, seu conjunto completo de flags e uma tabela descrevendo cada uma delas. Execute `databricks <command> --help` para conferir o comportamento atual das flags, já que a CLI é a fonte da verdade.

## Configuração local \{#local-setup\}

Copie `.env.example` para `.env` e preencha a URL do seu workspace e os IDs dos recursos antes de executar `npm run dev`. O AppKit lê esses valores para as conexões locais com os recursos do Databricks.

Exemplo de `.env` para um app com [Lakebase Postgres](/docs/lakebase/quickstart):

```text
DATABRICKS_HOST=https://<workspace>.cloud.databricks.com
LAKEBASE_ENDPOINT=projects/<project>/branches/production/endpoints/primary
```

Se o seu app usa Lakebase, conceda também ao seu usuário local a função `databricks_superuser` antes de executá-lo localmente. O service principal do app cria os schemas e as tabelas na primeira implantação e se torna o proprietário deles. Sem essa concessão, sua identidade local não conseguirá acessar esses objetos:

```sql
GRANT databricks_superuser TO "<your-email>";
```

Consulte [Desenvolvimento com Lakebase](/docs/lakebase/development#local-database-access) para ver o fluxo completo de acesso local.

Para testar com dados de produção sem precisar reimplantar, consulte o [remote bridge](/docs/appkit/v0/development/remote-bridge).


## Adicionar um plugin \{#add-a-plugin\}

Para adicionar um plugin a um app existente, importe-o e registre-o em `createApp`, no arquivo `server/server.ts`:

```typescript
import { createApp, genie, lakebase, server } from "@databricks/appkit";

const AppKit = await createApp({
  plugins: [server(), lakebase(), genie()],
});
```

Em seguida, regenere o `appkit.plugins.json` com os requisitos de recursos atualizados:

```bash
npx @databricks/appkit plugin sync --write
```

Isso é executado automaticamente durante `npm run dev` e `npm run build`. Faça o commit do `appkit.plugins.json` atualizado junto com o seu código. É ele que informa ao pipeline de implantação quais recursos provisionar.

Consulte a [referência de plugins do AppKit](/docs/appkit/v0/plugins) para ver as opções de configuração de cada plugin, ou [Criando plugins personalizados](/docs/appkit/v0/plugins/custom-plugins) para adicionar os seus próprios.


## Descobrir plugins \{#discover-plugins\}

Liste os plugins disponíveis e os campos de recurso obrigatórios de cada um:

```bash title="Common"
databricks apps manifest
```

```bash title="All Options"
databricks apps manifest \
  --template $TEMPLATE_URL \
  --branch $BRANCH \
  --version $APPKIT_VERSION \
  --debug \
  -o json \
  --target $TARGET \
  --var "key=value" \
  --profile $DATABRICKS_PROFILE
```

<!-- cli-options:apps manifest -->

| Opção             | Descrição                                                                                                   |
| ----------------- | ----------------------------------------------------------------------------------------------------------- |
| `--branch`        | Branch ou tag do Git (para templates do GitHub, mutuamente exclusivo com --version)                         |
| `--template`      | Caminho do template (diretório local ou URL do GitHub)                                                      |
| `--version`       | Versão do AppKit para o template padrão (padrão: main, use &#39;latest&#39; para a branch main)             |
| `--debug`         | ativa o log de depuração                                                                                    |
| `--output`, `-o`  | tipo de saída: text ou json (padrão: text)                                                                  |
| `--profile`, `-p` | perfil do ~/.databrickscfg                                                                                  |
| `--target`, `-t`  | target do bundle a ser usado (se aplicável)                                                                 |
| `--var`           | define valores para as variáveis declaradas na configuração do bundle. Exemplo: --var=&quot;key=value&quot; |

<!-- /cli-options -->


## Opções de scaffold \{#scaffold-options\}

Use `databricks apps init` para gerar a estrutura de um novo projeto AppKit. O [Início rápido de Apps](/docs/apps/quickstart) apresenta o caminho mais direto. Use estas opções para scaffolding não interativo ou avançado.

```bash title="Common"
databricks apps init --name my-app
```

```bash title="All Options"
databricks apps init \
  --name $APP_NAME \
  --features lakebase,analytics \
  --set lakebase.postgres.project=projects/$PROJECT_ID \
  --set lakebase.postgres.branch=projects/$PROJECT_ID/branches/production \
  --set lakebase.postgres.database=projects/$PROJECT_ID/branches/production/databases/$DB_NAME \
  --set analytics.sql-warehouse.id=$WAREHOUSE_ID \
  --description "My App" \
  --output-dir $OUTPUT_DIR \
  --template $TEMPLATE_URL \
  --branch $BRANCH \
  --deploy \
  --run none \
  --skip-install \
  --version $APPKIT_VERSION \
  --debug \
  -o json \
  --target $TARGET \
  --var "key=value" \
  --profile $DATABRICKS_PROFILE
```

<!-- cli-options:apps init -->

| Opção             | Descrição                                                                                                       |
| ----------------- | --------------------------------------------------------------------------------------------------------------- |
| `--branch`        | Branch ou tag do Git (para templates do GitHub, mutuamente exclusivo com --version)                             |
| `--deploy`        | Faz o deploy do app após a criação                                                                              |
| `--description`   | Descrição do app                                                                                                |
| `--features`      | Funcionalidades/plugins a habilitar (separados por vírgula, conforme definido no manifesto do template)         |
| `--output-dir`    | Diretório onde o projeto será gravado                                                                           |
| `--run`           | Executa o app após a criação (none, dev, dev-remote)                                                            |
| `--set`           | Define valores de recursos (formato: plugin.resourceKey.field=value, é possível especificar vários)             |
| `--skip-install`  | Ignora a instalação das dependências do projeto (ex.: npm install / uv sync). Não pode ser combinado com --run. |
| `--template`      | Caminho do template (diretório local ou URL do GitHub)                                                          |
| `--version`       | Versão do AppKit a utilizar (padrão: detectada automaticamente, use &#39;latest&#39; para a branch main)        |
| `--debug`         | habilita o log de depuração                                                                                     |
| `--output`, `-o`  | tipo de saída: text ou json (padrão text)                                                                       |
| `--profile`, `-p` | perfil do ~/.databrickscfg                                                                                      |
| `--target`, `-t`  | target do bundle a ser usado (se aplicável)                                                                     |
| `--var`           | define valores para variáveis definidas na configuração do bundle. Exemplo: --var=&quot;key=value&quot;         |

<!-- /cli-options -->

Passar `--name` suprime os prompts e aplica os valores padrão às opções não especificadas. Os nomes de apps devem estar em minúsculas, separados por hífen e ter no máximo 26 caracteres. Execute `databricks apps manifest` para ver os plugins disponíveis e suas chaves de `--set`.


## Configuração de ambiente \{#environment-configuration\}

**Local** (`npm run dev`): variáveis do arquivo `.env` na raiz do projeto.

**Implantado**: variáveis das entradas `env` do `app.yaml`. Use `value` para strings simples e `valueFrom` para vínculos de recursos:

```yaml
env:
  - name: LAKEBASE_ENDPOINT
    valueFrom: postgres
  - name: WAREHOUSE_ID
    valueFrom: sql-warehouse
  - name: APP_LOG_LEVEL
    value: info
```

Os recursos referenciados por `valueFrom` devem ser declarados no `databricks.yml`. Consulte [Configuração do app](/docs/apps/configuration#resources) para ver a lista completa de recursos.


## Checklist pré-implantação \{#pre-deploy-checklist\}

Antes de implantar em produção:

- O app escuta em `0.0.0.0` na porta `DATABRICKS_APP_PORT`
- O comando em `app.yaml` usa sintaxe de array (sem strings de shell)
- Nenhum arquivo maior que 10 MB no projeto
- Os segredos usam `valueFrom` (nunca `value`)
- O `databricks.yml` declara todos os recursos necessários
- O `databricks apps validate` é concluído com sucesso (`--skip-tests` ignora os testes para uma execução mais rápida)
- O `npm run build` é concluído com sucesso localmente

## Validar \{#validate\}

Execute a validação a partir do diretório do projeto do seu app antes de implantar:

```bash
databricks apps validate --profile $DATABRICKS_PROFILE
```

A validação executa build, verificação de tipos e lint. Passe `--skip-tests` para uma execução mais rápida.


## Implantar \{#deploy\}

```bash title="Common"
databricks apps deploy
```

```bash title="All Options"
databricks apps deploy $APP_NAME \
  --deployment-id $DEPLOYMENT_ID \
  --json @$CONFIG_FILE \
  --source-code-path $SOURCE_PATH \
  --git-branch $GIT_BRANCH \
  --git-commit $GIT_COMMIT \
  --git-tag $GIT_TAG \
  --git-source-code-path $GIT_SOURCE_PATH \
  --mode SNAPSHOT \
  --auto-approve \
  --skip-validation \
  --skip-tests \
  --force \
  --no-wait \
  --timeout 20m \
  --debug \
  -o json \
  --target $TARGET \
  --var "key=value" \
  --profile $DATABRICKS_PROFILE
```

<!-- cli-options:apps deploy -->

| Opção                    | Descrição                                                                                               |
| ------------------------ | ------------------------------------------------------------------------------------------------------- |
| `--auto-approve`         | Ignora aprovações interativas que possam ser necessárias para a implantação.                            |
| `--deployment-id`        | O id único da implantação.                                                                              |
| `--force`                | Força a substituição da validação de branch do Git.                                                     |
| `--git-branch`           | Branch do Git a partir da qual implantar.                                                               |
| `--git-commit`           | SHA do commit do Git a partir do qual implantar.                                                        |
| `--git-source-code-path` | Caminho relativo do código-fonte do app dentro do repositório Git. O padrão é a raiz do repositório.    |
| `--git-tag`              | Tag do Git a partir da qual implantar.                                                                  |
| `--json`                 | string JSON em linha ou @caminho/para/arquivo.json com o corpo da requisição (padrão JSON (0 bytes))    |
| `--mode`                 | O modo pelo qual a implantação gerenciará o código-fonte. Valores suportados: [AUTO&#95;SYNC, SNAPSHOT] |
| `--no-wait`              | não aguardar até atingir o estado SUCCEEDED                                                             |
| `--skip-tests`           | Ignora a execução de testes durante a validação (padrão true)                                           |
| `--skip-validation`      | Ignora a validação do projeto (build, typecheck, lint)                                                  |
| `--source-code-path`     | O caminho no sistema de arquivos do workspace do código-fonte usado para criar a implantação do app.    |
| `--timeout`              | tempo máximo para atingir o estado SUCCEEDED (padrão 20m0s)                                             |
| `--debug`                | habilita o log de depuração                                                                             |
| `--output`, `-o`         | tipo de saída: text ou json (padrão text)                                                               |
| `--profile`, `-p`        | perfil do ~/.databrickscfg                                                                              |
| `--target`, `-t`         | target do bundle a ser usado (se aplicável)                                                             |
| `--var`                  | define valores para variáveis definidas na configuração do bundle. Exemplo: --var=&quot;key=value&quot; |

<!-- /cli-options -->

A CLI valida a configuração, compila o projeto, faz o upload e inicia o app. Por padrão, executa a mesma validação de projeto que `databricks apps validate` (build, typecheck, lint). Use `--skip-validation` para pular essa etapa. Não é necessário informar `--source-code-path` ao implantar a partir de um projeto AppKit criado por scaffolding.


### Verifique a implantação \{#verify-the-deployment\}

Confira se o app foi implantado com sucesso:

```bash title="Common"
databricks apps get my-app -o json
```

```bash title="All Options"
databricks apps get $APP_NAME \
  -o json \
  --debug \
  --target $TARGET \
  --var "key=value" \
  --profile $DATABRICKS_PROFILE
```

<!-- cli-options:apps get -->

| Opção             | Descrição                                                                                               |
| ----------------- | ------------------------------------------------------------------------------------------------------- |
| `--debug`         | ativa o log de depuração                                                                                |
| `--output`, `-o`  | tipo de saída: text ou json (padrão: text)                                                              |
| `--profile`, `-p` | perfil do ~/.databrickscfg                                                                              |
| `--target`, `-t`  | target do bundle a ser usado (se aplicável)                                                             |
| `--var`           | define valores para variáveis definidas na configuração do bundle. Exemplo: --var=&quot;key=value&quot; |

<!-- /cli-options -->

<details>
<summary>Exemplo de saída</summary>

```json
{
  "name": "my-app",
  "url": "https://my-app-1234567890.us-west-2.databricksapps.com",
  "description": "A Databricks App powered by AppKit",
  "compute_size": "MEDIUM",
  "app_status": {
    "message": "App has status: App is running",
    "state": "RUNNING"
  },
  "compute_status": {
    "message": "App compute is running.",
    "state": "ACTIVE"
  },
  "active_deployment": {
    "deployment_id": "a1b2c3d4e5f6",
    "source_code_path": "/Workspace/Users/you@example.com/.bundle/my-app/default/files",
    "status": {
      "message": "App started successfully",
      "state": "SUCCEEDED"
    }
  },
  "resources": [
    {
      "name": "postgres",
      "postgres": {
        "branch": "projects/my-project/branches/production",
        "database": "projects/my-project/branches/production/databases/db-abc123",
        "permission": "CAN_CONNECT_AND_CREATE"
      }
    }
  ],
  "service_principal_client_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
}
```

</details>

Visualize os logs:

```bash title="Common"
databricks apps logs my-app
```

```bash title="All Options"
databricks apps logs $APP_NAME \
  --follow \
  --tail-lines 200 \
  --timeout 5m \
  --source APP \
  --search "$SEARCH_TERM" \
  --output-file $LOG_FILE \
  --debug \
  -o json \
  --target $TARGET \
  --var "key=value" \
  --profile $DATABRICKS_PROFILE
```

<!-- cli-options:apps logs -->

| Opção             | Descrição                                                                                                |
| ----------------- | -------------------------------------------------------------------------------------------------------- |
| `--follow`, `-f`  | Continua transmitindo os logs até ser interrompido.                                                      |
| `--tail-lines`    | Número de linhas recentes de log a exibir antes da transmissão. Defina 0 para exibir tudo. (padrão 200)  |
| `--timeout`       | Tempo máximo de transmissão quando --follow está ativo. 0 desativa o tempo limite.                       |
| `--search`        | Envia um termo de busca ao serviço de logs antes da transmissão.                                         |
| `--source`        | Restringe os logs às origens APP e/ou SYSTEM.                                                            |
| `--output-file`   | Caminho de arquivo opcional para gravar os logs além da saída padrão (stdout).                           |
| `--debug`         | ativa o log de depuração                                                                                 |
| `--output`, `-o`  | tipo de saída: text ou json (padrão text)                                                                |
| `--profile`, `-p` | perfil do ~/.databrickscfg                                                                               |
| `--target`, `-t`  | target do bundle a ser usado (se aplicável)                                                              |
| `--var`           | define valores para variáveis declaradas na configuração do bundle. Exemplo: --var=&quot;key=value&quot; |

<!-- /cli-options -->


<details>
<summary>Exemplo de saída de log</summary>

```text
[SYSTEM] [INFO] Starting Databricks Apps runtime...
[SYSTEM] [INFO] Starting deployment a1b2c3d4e5f6...
[SYSTEM] [INFO] Downloading source code from /Workspace/Users/.../src/a1b2c3d4e5f6
[SYSTEM] [INFO] Installing dependencies...
[BUILD] added 899 packages, and audited 900 packages in 21s
[SYSTEM] [INFO] Dependencies installed successfully.
[SYSTEM] [INFO] Running build script npm run build:server && npm run build:client
[BUILD] ✔ Build complete in 30ms
[BUILD] ✓ built in 2.80s
[SYSTEM] [INFO] Build completed successfully.
[SYSTEM] [INFO] Starting app with command: [npm run start]
[APP] [appkit:lakebase] Lakebase pool initialized
[APP] [appkit:server] Server running on http://0.0.0.0:8000
[APP] [appkit:server] Mode: production (static)
```

</details>


## Gerenciamento de apps \{#managing-apps\}

```bash title="Common"
databricks apps stop my-app
databricks apps start my-app
databricks apps delete my-app
```

```bash title="All Options"
databricks apps stop $APP_NAME \
  --no-wait \
  --timeout 20m \
  --debug \
  -o json \
  --target $TARGET \
  --var "key=value" \
  --profile $DATABRICKS_PROFILE

databricks apps start $APP_NAME \
  --no-wait \
  --timeout 20m \
  --debug \
  -o json \
  --target $TARGET \
  --var "key=value" \
  --profile $DATABRICKS_PROFILE

databricks apps delete $APP_NAME \
  --auto-approve \
  --force-lock \
  --debug \
  -o json \
  --target $TARGET \
  --var "key=value" \
  --profile $DATABRICKS_PROFILE
```


#### Opções de `apps stop` \{#apps-stop-options\}

<!-- cli-options:apps stop -->

| Opção             | Descrição                                                                     |
| ----------------- | ----------------------------------------------------------------------------- |
| `--no-wait`       | não aguardar até atingir o estado STOPPED                                     |
| `--timeout`       | tempo máximo para atingir o estado STOPPED (padrão 20m0s)                     |
| `--debug`         | ativar log de depuração                                                       |
| `--output`, `-o`  | tipo de saída: text ou json (padrão text)                                     |
| `--profile`, `-p` | perfil do ~/.databrickscfg                                                    |
| `--target`, `-t`  | target do bundle a ser usado (se aplicável)                                   |
| `--var`           | define valores para variáveis declaradas na configuração do bundle. Exemplo: --var="key=value" |

<!-- /cli-options -->

#### Opções de `apps start` \{#apps-start-options\}

<!-- cli-options:apps start -->

| Opção             | Descrição                                                                            |
| ----------------- | ------------------------------------------------------------------------------------ |
| `--no-wait`       | não aguardar até atingir o estado ACTIVE                                              |
| `--timeout`       | tempo máximo para atingir o estado ACTIVE (padrão 20m0s)                              |
| `--debug`         | ativar logs de depuração                                                              |
| `--output`, `-o`  | tipo de saída: text ou json (padrão text)                                             |
| `--profile`, `-p` | perfil do ~/.databrickscfg                                                            |
| `--target`, `-t`  | target do bundle a ser usado (se aplicável)                                           |
| `--var`           | define valores para variáveis definidas na configuração do bundle. Exemplo: --var="key=value" |

<!-- /cli-options -->

#### Opções do `apps delete` \{#apps-delete-options\}

<!-- cli-options:apps delete -->

| Opção             | Descrição                                                                     |
| ----------------- | ----------------------------------------------------------------------------- |
| `--auto-approve`  | Ignora as aprovações interativas para exclusão de recursos e arquivos          |
| `--force-lock`    | Força a aquisição do bloqueio de implantação.                                 |
| `--debug`         | ativa o log de depuração                                                      |
| `--output`, `-o`  | tipo de saída: text ou json (padrão: text)                                    |
| `--profile`, `-p` | perfil do ~/.databrickscfg                                                    |
| `--target`, `-t`  | target do bundle a ser usado (se aplicável)                                   |
| `--var`           | define valores para variáveis declaradas na configuração do bundle. Exemplo: --var="key=value" |

<!-- /cli-options -->

O `apps delete` pede confirmação. Use `--auto-approve` em CI para pular a confirmação.

## CI/CD \{#cicd\}

Para deploys automatizados em CI, defina `DATABRICKS_HOST` e `DATABRICKS_TOKEN` (ou use OAuth com `DATABRICKS_CLIENT_ID` e `DATABRICKS_CLIENT_SECRET`):

```bash
DATABRICKS_HOST=https://<workspace>.cloud.databricks.com \
DATABRICKS_TOKEN=dapi... \
databricks apps deploy
```

Ou use um perfil pré-configurado:

```bash
databricks apps deploy --profile ci-profile
```

Consulte a [documentação de autenticação da Databricks CLI](/docs/tools/databricks-cli#authenticate) para ver todos os métodos de autenticação.


## Solução de problemas \{#troubleshooting\}

Para mais informações sobre solução de problemas, consulte [Deploy apps](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/deploy#troubleshoot) e o [AppKit remote bridge](/docs/appkit/v0/development/remote-bridge) em caso de problemas de conexão local.

- **Falha ao implantar o app**: verifique as mensagens de erro nos logs, valide a sintaxe do `app.yaml` e confirme se os segredos e as variáveis de ambiente da seção `env` são resolvidos corretamente. Confirme também que todas as dependências estão incluídas ou instaladas.
- **Erros 401 (autenticação)**: verifique se o seu token é válido (`databricks auth token --profile <PROFILE>`), se não expirou e se inclui os escopos de OAuth necessários. Os escopos do token devem ser um superconjunto dos escopos configurados para a [autorização de usuário](/docs/appkit/v0/plugins/execution-context) do app.
- **Erros 403 (permissão negada)**: verifique se você tem a permissão `CAN USE` no app. Escopos de OAuth insuficientes também podem gerar erros 403, mesmo com as permissões corretas.
- **Erros 404 (app não encontrado)**: verifique se o nome do app e a URL do workspace estão corretos, se o app está implantado e em execução e se o caminho do endpoint existe.
- **Falha na implantação via Git**: em repositórios privados, verifique se o service principal do app tem uma credencial Git configurada. Se a implantação for feita por CLI/API/DABs, crie o app primeiro e depois adicione a credencial Git.

## Documentação do AppKit \{#appkit-docs\}

Acesse a referência da API do AppKit, a documentação de componentes e a documentação de plugins direto do terminal:

```bash
npx @databricks/appkit docs                        # navegue pelo índice da documentação
npx @databricks/appkit docs --full                 # índice completo com todas as entradas da API
npx @databricks/appkit docs "<query-or-doc-path>"  # veja uma seção ou arquivo específico
```

Execute sem argumentos para navegar pelo índice. Útil ao desenvolver com um assistente de codificação com IA. Aponte-o para cá em vez de adivinhar os formatos das APIs, ou consulte a [referência do AppKit](/docs/appkit/v0) neste site.


## Próximos passos \{#where-to-next\}

Explore o [catálogo de templates](/templates) para começar a desenvolver ou adicione recursos ao seu app: [Lakebase Postgres](/docs/lakebase/overview) para armazenamento persistente ou [Agent Bricks](/docs/agents/overview) para funcionalidades de IA.