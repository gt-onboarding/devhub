---
title: Desenvolvimento com Lakebase Postgres
sidebar_label: Desenvolvimento
sourceOfTruth:
  skills:
    - databricks-lakebase
    - databricks-dabs
  docs:
    - /docs/appkit/v0/plugins/lakebase
    - https://docs.databricks.com/aws/en/oltp/
---

# Desenvolvimento com Lakebase Postgres \{#lakebase-postgres-development\}

Esta página aborda o desenvolvimento com Lakebase Postgres a partir de um app AppKit. Para o Lakebase em si (projetos, branches, autoscaling, conectividade), consulte a [documentação do Lakebase](https://docs.databricks.com/aws/en/oltp/) ou a agent skill [`databricks-lakebase`](/docs/tools/ai-tools/agent-skills).

## API do plugin do AppKit \{#appkit-plugin-api\}

O plugin `lakebase()` fornece um `pg.Pool` padrão com refresh automático de tokens OAuth. Depois de registrado, acesse-o por meio de `AppKit.lakebase`:

```typescript
import { createApp, lakebase, server } from "@databricks/appkit";

const AppKit = await createApp({
  plugins: [server(), lakebase()],
});

// Consulta parametrizada padrão
const { rows } = await AppKit.lakebase.query<{ id: number; name: string }>(
  "SELECT id, name FROM app.items WHERE active = $1",
  [true],
);

// Configuração pronta para ORM (Drizzle, Prisma, TypeORM, etc.)
const ormConfig = AppKit.lakebase.getOrmConfig();
// Retorna: { host, port, database, ssl, user, ... }

// Configuração compatível com pg
const pgConfig = AppKit.lakebase.getPgConfig();

// pg.Pool puro para uso avançado
const pool = AppKit.lakebase.pool;
```


### Configuração do pool \{#pool-configuration\}

Sobrescreva os valores padrão do pool de conexões passando um objeto `pool`:

```typescript
lakebase({
  pool: {
    max: 10, // máximo de conexões (padrão: 10)
    connectionTimeoutMillis: 5000, // tempo limite de conexão em ms (padrão: 10000)
    idleTimeoutMillis: 30000, // tempo limite de inatividade em ms (padrão: 30000)
  },
});
```

O padrão `max: 10` aplica-se ao pool compartilhado do service principal. Já os pools por usuário, criados em nome do usuário por `asUser(req)`, têm como padrão `max: 3`.


### Integração de cache \{#caching-integration\}

O Lakebase Postgres também serve de base para o [plugin de cache do AppKit](/docs/appkit/v0/plugins/caching) quando está íntegro. Para a API completa, a integração com ORM e a configuração de conexão, consulte a [referência do plugin](/docs/appkit/v0/plugins/lakebase).

## Modelo de autenticação \{#auth-model\}

O Lakebase Postgres autentica conexões de banco de dados usando tokens OAuth ou senhas nativas do Postgres. O método depende de onde seu app é executado.

**Apps implantados**: ao adicioná-lo como recurso a um Databricks App, o Databricks cria um service principal automaticamente, concede a ele uma role correspondente no Postgres e injeta os detalhes de conexão como variáveis de ambiente. O plugin `lakebase()` do AppKit cuida do refresh do token OAuth automaticamente.

**Desenvolvimento local**: sua identidade pessoal do Databricks se conecta com um token OAuth gerado pelo comando `databricks postgres generate-database-credential`. Os tokens expiram após uma hora, mas a expiração só é verificada no login: conexões já abertas continuam ativas mesmo depois que o token expira. Execute `databricks apps deploy` pelo menos uma vez antes de rodar `npm run dev`. A seção [Configuração local](#local-setup) explica por que a ordem importa e o que fazer caso você se depare com erros de permissão.

[About authentication](https://docs.databricks.com/aws/en/oltp/projects/authentication) aborda a autenticação por senha do Postgres, a rotação de tokens e os fluxos máquina a máquina.

## Configuração local \{#local-setup\}

O comando `databricks apps init` preenche o `.env` com os valores corretos de conexão do Lakebase Postgres. Execute `databricks apps deploy` antes de `npm run dev`. A implantação configura uma identidade gerenciada (o service principal do app), que cria o schema `app` e as tabelas na primeira inicialização e se torna proprietária deles. Se, em vez disso, você executar `npm run dev` primeiro, esses objetos serão criados com as suas credenciais pessoais. Nesse caso, o app implantado não conseguirá acessá-los e retornará o erro `permission denied for schema app`.

### Acesso local ao banco de dados \{#local-database-access\}

Se você criou o projeto Lakebase Postgres, sua identidade já tem o acesso necessário. Depois que `databricks apps deploy` for executado uma vez, `npm run dev` funciona.

Para colaboradores que precisam de acesso local de leitura/escrita, conceda a eles uma role na branch pela interface do Lakebase (**Roles &amp; Databases**). A autenticação por senha do Postgres é uma alternativa ao OAuth: habilite as conexões por senha, crie uma role com senha e use essa senha como `PGPASSWORD` no `.env`. [About authentication](https://docs.databricks.com/aws/en/oltp/projects/authentication) descreve os passos para as duas opções.

Você também pode gerar uma credencial de curta duração para usar com qualquer cliente PostgreSQL (DBeaver, pgAdmin, DataGrip ou um driver de linguagem):

```bash
databricks postgres generate-database-credential \
  projects/my-project/branches/production/endpoints/primary
```

A [documentação do plugin do AppKit: desenvolvimento local](/docs/appkit/v0/plugins/lakebase#local-development) aborda alternativas de permissões granulares para equipes que precisam de acesso restrito ao escopo do schema.


## Conectar com psql \{#connect-with-psql\}

O `databricks psql` abre uma sessão interativa do PostgreSQL em um endpoint de branch. É necessário ter o `psql` instalado localmente. Se nenhum destino for informado, o comando pede que você escolha entre os bancos de dados a que tem acesso.

```bash title="Common"
databricks psql --project my-project
```

```bash title="All Options"
databricks psql \
  --project $PROJECT_ID \
  --branch $BRANCH_ID \
  --endpoint $ENDPOINT_ID \
  --autoscaling \
  --max-retries 3 \
  --debug \
  -o json \
  --target $TARGET \
  --profile $DATABRICKS_PROFILE
```

<!-- cli-options:psql -->

| Opção             | Descrição                                          |
| ----------------- | -------------------------------------------------- |
| `--autoscaling`   | Mostrar apenas projetos com Lakebase Autoscaling   |
| `--project`       | ID do projeto                                      |
| `--branch`        | ID da branch (padrão: seleção automática)          |
| `--endpoint`      | ID do endpoint (padrão: seleção automática)        |
| `--max-retries`   | Tentativas de conexão; 0 para desativar (padrão 3) |
| `--debug`         | ativar log de depuração                            |
| `--output`, `-o`  | tipo de saída: text ou json (padrão text)          |
| `--profile`, `-p` | perfil do ~/.databrickscfg                         |
| `--target`, `-t`  | bundle target a ser usado (se aplicável)           |

<!-- /cli-options -->

Passe argumentos adicionais diretamente para o `psql` após o separador `--`, por exemplo: `databricks psql --project my-project -- -c "SELECT 1"`.


## Feature branches \{#feature-branches\}

Use as branches do Lakebase Postgres para isolar alterações de esquema e testar migrações sem afetar a produção:

```bash title="Common"
databricks postgres create-branch projects/my-project feature-xyz \
  --json '{"spec": {"no_expiry": true}}'
```

```bash title="All Options"
databricks postgres create-branch \
  projects/$PROJECT_ID \
  $BRANCH_ID \
  --json '{"spec": {"source_branch": "projects/$PROJECT_ID/branches/$SOURCE_BRANCH_ID", "no_expiry": true}}' \
  --replace-existing \
  --debug \
  -o json \
  --target $TARGET \
  --no-wait \
  --timeout 10m \
  --profile $DATABRICKS_PROFILE
```

<!-- cli-options:postgres create-branch -->

| Opção                | Descrição                                                                                          |
| -------------------- | -------------------------------------------------------------------------------------------------- |
| `--json`             | string JSON inline ou @caminho/para/arquivo.json com o corpo da requisição (padrão JSON (0 bytes)) |
| `--no-wait`          | não aguardar até atingir o estado DONE                                                             |
| `--replace-existing` | Se verdadeiro, atualiza a branch caso ela já exista, em vez de retornar um erro.                   |
| `--timeout`          | tempo máximo para atingir o estado DONE                                                            |
| `--debug`            | habilitar log de depuração                                                                         |
| `--output`, `-o`     | tipo de saída: text ou json (padrão text)                                                          |
| `--profile`, `-p`    | perfil de ~/.databrickscfg                                                                         |
| `--target`, `-t`     | bundle target a ser usado (se aplicável)                                                           |

<!-- /cli-options -->

Um endpoint `primary` de leitura e escrita é criado automaticamente, herdando as `default_endpoint_settings` do projeto. As branches exigem uma política de expiração (`ttl`, `expire_time` ou `no_expiry: true`). Consulte [Expiração de branch](https://docs.databricks.com/aws/en/oltp/projects/manage-branches#expiration) para conhecer as políticas disponíveis.

Exclua ao terminar:

```bash title="Common"
databricks postgres delete-branch projects/my-project/branches/feature-xyz
```

```bash title="All Options"
databricks postgres delete-branch \
  projects/$PROJECT_ID/branches/$BRANCH_ID \
  --purge \
  --no-wait \
  --timeout 10m \
  --debug \
  -o json \
  --target $TARGET \
  --profile $DATABRICKS_PROFILE
```

<!-- cli-options:postgres delete-branch -->

| Opção             | Descrição                                                                |
| ----------------- | ------------------------------------------------------------------------ |
| `--no-wait`       | não aguardar até atingir o estado DONE                                   |
| `--purge`         | Se true, exclui a branch permanentemente; se false, faz exclusão lógica. |
| `--timeout`       | tempo máximo para atingir o estado DONE                                  |
| `--debug`         | ativar log de depuração                                                  |
| `--output`, `-o`  | tipo de saída: text ou json (padrão: text)                               |
| `--profile`, `-p` | perfil do ~/.databrickscfg                                               |
| `--target`, `-t`  | bundle target a ser usado (se aplicável)                                 |

<!-- /cli-options -->


## Aplicativos fora da plataforma \{#off-platform-apps\}

Para aplicativos hospedados fora do Databricks (AWS, Vercel, Netlify, entre outros), a plataforma não injeta detalhes de conexão nem renova tokens OAuth automaticamente. A rotação de tokens é responsabilidade do aplicativo. [Sobre a autenticação do Lakebase](https://docs.databricks.com/aws/en/oltp/projects/authentication) aborda a rotação de tokens e os padrões máquina a máquina. O template [Lakebase Off-Platform](/templates/lakebase-off-platform) inclui uma implementação completa, com configuração de ambiente e integração com o Drizzle ORM.

Para provisionar e conectar sem um template, crie um projeto, consulte seu endpoint e banco de dados e, em seguida, conecte-se:

```bash
databricks postgres create-project <project-id>
databricks postgres list-endpoints projects/<project-id>/branches/production -o json
databricks postgres list-databases projects/<project-id>/branches/production -o json
databricks psql --project <project-id>
```

`create-project` cria um projeto com uma branch `production` padrão, um banco de dados `databricks_postgres` e um endpoint de leitura e escrita. Se você não tiver o `psql`, execute `databricks postgres generate-database-credential <endpoint-path>` e use o token retornado como senha (o nome de usuário é seu e-mail do Databricks) em qualquer cliente PostgreSQL. Consulte a [documentação do Lakebase](https://docs.databricks.com/aws/en/oltp/) ou a agent skill [`databricks-lakebase`](/docs/tools/ai-tools/agent-skills) para conhecer o fluxo completo e as flags.

Os valores que você precisa obter na saída de `list-endpoints` e `list-databases`:

| Valor                          | Caminho JSON               | Usado para                   |
| ------------------------------ | -------------------------- | ---------------------------- |
| Host do endpoint               | `status.hosts.host`        | `PGHOST`                     |
| Caminho do recurso do endpoint | `name`                     | `LAKEBASE_ENDPOINT`          |
| Caminho do recurso do banco    | `name` (de list-databases) | `lakebase.postgres.database` |
| Nome do banco PostgreSQL       | `status.postgres_database` | `PGDATABASE`                 |


## Operações de longa duração \{#long-running-operations\}

Por padrão, os comandos de criação, atualização e exclusão bloqueiam até a conclusão. Use `--no-wait` para retornar imediatamente e consultar o status:

```bash
databricks postgres create-project my-project \
  --json '{"spec": {"display_name": "My Project"}}' \
  --no-wait

databricks postgres get-operation projects/my-project/operations/<operation-id>
```


## Declarative Automation Bundles \{#declarative-automation-bundles\}

Os Declarative Automation Bundles (DABs) permitem definir a infraestrutura do Lakebase Postgres como código no `databricks.yml`, versionada junto com sua aplicação. Um bundle especifica `postgres_projects`, `postgres_branches` e `postgres_endpoints` sob `resources`.

<details>
<summary>Exemplo de <code>databricks.yml</code> com um projeto, uma branch de desenvolvimento e uma réplica somente leitura</summary>

```yaml
bundle:
  name: my-lakebase-app

resources:
  postgres_projects:
    my_app:
      project_id: "my-lakebase-app"
      display_name: "My Lakebase Postgres App"
      pg_version: 17
      history_retention_duration: "172800s"
      default_endpoint_settings:
        autoscaling_limit_min_cu: 0.5
        autoscaling_limit_max_cu: 1.0
        suspend_timeout_duration: "300s"
        pg_settings:
          log_min_duration_statement: "1000"

  postgres_branches:
    dev_branch:
      parent: ${resources.postgres_projects.my_app.id}
      branch_id: "dev"
      no_expiry: true
      is_protected: false

  postgres_endpoints:
    read_replica:
      parent: ${resources.postgres_branches.dev_branch.id}
      endpoint_id: "replica"
      endpoint_type: "ENDPOINT_TYPE_READ_ONLY"
      autoscaling_limit_min_cu: 0.5
      autoscaling_limit_max_cu: 0.5
```

</details>


### Validar e implantar \{#validate-and-deploy\}

```bash
databricks bundle validate
databricks bundle deploy
```

`bundle deploy` é idempotente: cria novos recursos e atualiza os existentes para refletir a configuração. Diferentemente de Databricks Jobs ou Apps, não existe uma etapa `bundle run`. Os recursos do Lakebase Postgres ficam ativos assim que são implantados. A [documentação dos Declarative Automation Bundles](https://docs.databricks.com/aws/en/dev-tools/bundles/) descreve todas as opções, e a agent skill [`databricks-dabs`](/docs/tools/ai-tools/agent-skills) pode criar e validar bundles.


## Máscaras de atualização \{#update-masks\}

Os comandos de atualização exigem uma máscara de atualização que indique quais campos devem ser modificados. O payload `--json` contém os novos valores. Apenas os campos incluídos na máscara são alterados.

```bash
databricks postgres update-branch \
  projects/my-project/branches/production \
  spec.is_protected \
  --json '{"spec": {"is_protected": true}}'
```

Para vários campos, use uma máscara de atualização separada por vírgulas (por exemplo, `spec.autoscaling_limit_min_cu,spec.autoscaling_limit_max_cu`).


## Solução de problemas \{#troubleshooting\}

Para problemas de configuração de Databricks Apps (recursos em `databricks.yml` e `app.yaml`), consulte [Add a Lakebase resource to a Databricks app](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/lakebase), que traz a referência de recursos e variáveis de ambiente. Para problemas de conexão, incluindo o despertar após ociosidade e o formato do endpoint, consulte [Troubleshooting in Connect external apps](https://docs.databricks.com/aws/en/oltp/projects/external-apps-connect#troubleshooting), que traz as correções.

- **`permission denied for schema app` (app implantado)**: `npm run dev` foi executado antes de `databricks apps deploy`, de modo que o schema pertence às suas credenciais pessoais e o service principal do app não consegue acessá-lo. _(No PostgreSQL, a propriedade de um schema está vinculada à role que o criou e não pode ser reatribuída por usuários comuns.)_ Se houver dados a preservar, exporte-os (com `pg_dump` ou copiando as tabelas para um schema temporário) antes de removê-lo. Em seguida, remova o schema e reimplante para que o SP o recrie na inicialização: `databricks psql --project <project-id> -- -c "DROP SCHEMA IF EXISTS app CASCADE;"` e depois `databricks apps deploy`.
- **`permission denied for schema app` (desenvolvimento local, colaborador)**: Somente quem criou o projeto Lakebase recebe acesso `databricks_superuser` automaticamente. Para conceder acesso local a um colega de equipe, o criador deve adicionar uma role para a identidade dele na branch (**Roles & Databases** na interface do Lakebase) ou configurar a autenticação por senha do Postgres. Consulte [About authentication](https://docs.databricks.com/aws/en/oltp/projects/authentication) para ver os passos.
- **`Unknown field path in update_mask: 'spec.suspend_timeout_duration'`**: Use `spec.suspension` como máscara de atualização para todas as alterações de suspensão em nível de endpoint feitas com `update-endpoint`. Para desativar o scale to zero, informe `{"spec": {"no_suspension": true}}`. Para alterar o tempo limite, informe `{"spec": {"suspend_timeout_duration": "300s"}}`. Não há suporte para definir `no_suspension: false`.
- **Conexão recusada após período de inatividade**: O Autoscaling do Lakebase faz scale to zero quando o recurso está ocioso. A primeira conexão após a inatividade dispara o despertar e pode sofrer um pequeno atraso. Se a sua biblioteca de conexão não fizer novas tentativas automaticamente, adicione um breve laço de repetição.

## Documentação do AppKit \{#appkit-docs\}

Acesse a referência da API do AppKit, a documentação dos componentes e a dos plugins direto pelo terminal:

```bash
npx @databricks/appkit docs                    # navegar pelo índice da documentação
npx @databricks/appkit docs "lakebase"         # ver a documentação do plugin do Lakebase Postgres
```

Ou consulte a [referência do plugin Lakebase Postgres do AppKit](/docs/appkit/v0/plugins/lakebase) neste site.


## Próximos passos \{#where-to-next\}

Os [templates](/templates) abrangem padrões comuns do Lakebase Postgres. Explore-os para encontrar um ponto de partida ou copie um deles para o seu agente de codificação e faça o scaffold de um app funcional.