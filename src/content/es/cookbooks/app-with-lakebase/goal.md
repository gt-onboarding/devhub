Una Databricks App con Lakebase Postgres para el almacenamiento persistente de datos. La aplicación incluye la configuración del schema, rutas de API con CRUD completo y se despliega en la plataforma Databricks Apps.

### Componentes \{#components\}

1. **Create a Lakebase Project** — aprovisiona un proyecto de managed Postgres con un endpoint y una base de datos, y recopila los valores de conexión.
2. **Lakebase Data Persistence** — añade el plugin de Lakebase a tu aplicación con inicialización del schema, rutas CRUD y patrones de acceso a datos.