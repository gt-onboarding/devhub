Une connexion entre une application hébergée en dehors de la plateforme Databricks Apps (par exemple sur AWS, Vercel ou Netlify) et Lakebase Postgres. L&#39;application s&#39;appuie sur une configuration d&#39;environnement portable, sur la gestion des tokens avec actualisation automatique des identifiants et sur Drizzle ORM pour un accès typé à la base de données.

### Composants \{#components\}

1. **Gestion de l&#39;environnement Lakebase** — mettez en place une configuration d&#39;environnement validée par Zod pour sécuriser les valeurs de connexion Lakebase.
2. **Gestion des tokens Lakebase** — implémentez la récupération, la mise en cache et l&#39;actualisation automatique des tokens pour les identifiants Lakebase Postgres.
3. **Drizzle ORM avec Lakebase** — configurez un pool Drizzle ORM avec actualisation automatique des identifiants et prise en charge des migrations.