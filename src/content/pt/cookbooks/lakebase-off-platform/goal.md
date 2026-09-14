Uma conexão entre um app hospedado fora da plataforma Databricks Apps (por exemplo, na AWS, Vercel ou Netlify) e o Lakebase Postgres. O app usa configuração de ambiente portátil, gerenciamento de token com refresh automático de credenciais e o Drizzle ORM para acesso ao banco de dados com segurança de tipos.

### Componentes \{#components\}

1. **Gerenciamento de ambiente do Lakebase** — defina uma configuração de ambiente validada por Zod para armazenar com segurança os valores de conexão com o Lakebase.
2. **Gerenciamento de tokens do Lakebase** — implemente a obtenção, o cache e o refresh automático de tokens para as credenciais do Lakebase Postgres.
3. **Drizzle ORM com Lakebase** — configure um pool do Drizzle ORM com refresh automático de credenciais e suporte a migrações.