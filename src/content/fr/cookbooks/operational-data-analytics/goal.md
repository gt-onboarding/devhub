Un pipeline d&#39;analyse de données opérationnelles de bout en bout : les données transitent d&#39;une base OLTP (Lakebase Postgres) vers Unity Catalog par réplication CDC, sont transformées selon une architecture medallion (couches bronze, silver et gold), puis deviennent exploitables par les dashboards et les consommateurs en aval.

### Composants \{#components\}

1. **Configuration d&#39;Unity Catalog** — configurez Unity Catalog avec un stockage S3 externe pour le catalogue et le schéma de destination.
2. **Créer un projet Lakebase** — provisionnez un projet managed Postgres comme source OLTP.
3. **Change Data Feed (CDF) Lakebase** — activez la réplication continue des tables Lakebase vers les tables d&#39;historique Delta d&#39;Unity Catalog.
4. **Architecture medallion à partir du CDC** — construisez les couches silver (état courant) et gold (analytique) à partir des tables d&#39;historique CDC grâce aux Lakeflow Spark Declarative Pipelines.