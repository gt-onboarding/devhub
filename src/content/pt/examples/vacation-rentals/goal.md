Este modelo demonstra um console interno de operações para uma plataforma de aluguel por temporada (&quot;Wanderbricks&quot;). Os operadores acompanham o desempenho da receita por destino, processam uma fila de reservas com flags e notas do agent em cada reserva e fazem perguntas em linguagem natural sobre o negócio por meio de um painel de chat do Genie incorporado.

### Fluxo de dados \{#data-flow\}

O app combina quatro primitivas do Databricks por trás de uma única UI em React:

1. O **SQL warehouse** executa queries analíticas (receita por destino, detalhe de uma reserva específica) sobre as tabelas populadas `samples.wanderbricks.{bookings,properties,destinations,reviews}`. As queries ficam em `config/queries/*.sql` e são executadas pelo plugin `analytics` do AppKit.
2. O **Lakebase Postgres** armazena o estado gerenciado pelo operador nas tabelas `app.booking_flags` e `app.booking_notes`. O servidor Express cria o schema e as tabelas na inicialização e expõe rotas CRUD para sinalizar reservas e adicionar notas do agent.
3. O **Genie Agent** (&quot;Wanderbricks&quot;) é configurado sobre as tabelas de reservas, propriedades e destinos. O plugin `genie` do AppKit incorpora um painel de chat para que os usuários façam perguntas sobre gastos, ocupação e avaliações em linguagem natural.
4. O **Databricks App** une tudo: um servidor Express + AppKit e um cliente Vite/React/Tailwind, implantados por meio de um Declarative Automation Bundle (antigo Databricks Asset Bundle) que declara o SQL warehouse, o Genie Agent e o banco de dados Lakebase como recursos do app.

### O que adaptar \{#what-to-adapt\}

A configuração, as variáveis de ambiente e o deployment do bundle estão documentados no **`README.md`** do repositório.

Para adaptar este modelo ao seu caso:

* **Dados de origem**: aponte os arquivos SQL de análise para o seu próprio catálogo e schema, em vez de `samples.wanderbricks.*`. Ajuste os joins para refletir o seu modelo de reservas, propriedades e destinos.
* **SQL warehouse**: defina `sql_warehouse_id` no `databricks.yml` com o warehouse que você quer que o app consulte.
* **Lakebase**: substitua `postgres_branch` e `postgres_database` pelo seu próprio projeto, branch e banco de dados Lakebase. As tabelas `app.booking_flags` e `app.booking_notes` são criadas automaticamente na primeira execução.
* **Genie Agent**: crie um Genie Agent sobre suas tabelas de reservas e defina `genie_space_id` e `genie_space_name` no `databricks.yml`.
* **Terminologia do domínio**: a UI segue o tema de aluguéis por temporada (destinos, reservas, notas do agent). Para outros consoles operacionais (logística, suporte, parcerias), renomeie as rotas e os componentes e redirecione as queries de análise — o scaffolding de Lakebase + Genie + análise permanece o mesmo.