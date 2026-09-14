Una conexión desde una aplicación alojada fuera de la plataforma Databricks Apps (por ejemplo, en AWS, Vercel o Netlify) a Lakebase Postgres. La aplicación usa una configuración portable mediante variables de entorno, gestión de tokens con refresh automático de credenciales y Drizzle ORM para un acceso a la base de datos con tipado seguro.

### Componentes \{#components\}

1. **Gestión del entorno de Lakebase**: configura una configuración de entorno validada con Zod para los valores de conexión de Lakebase de forma segura.
2. **Gestión de tokens de Lakebase**: implementa la obtención, el almacenamiento en caché y la actualización automática de los tokens de las credenciales de Lakebase Postgres.
3. **Drizzle ORM con Lakebase**: configura un pool de Drizzle ORM con credenciales que se actualizan automáticamente y compatibilidad con migraciones.