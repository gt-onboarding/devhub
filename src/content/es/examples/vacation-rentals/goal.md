Este template muestra una consola de operaciones interna para una plataforma de alquileres vacacionales («Wanderbricks»). Los operadores consultan el rendimiento de los ingresos por destino, procesan una cola de reservas con flags por reserva y notas del agent, y hacen preguntas en lenguaje natural sobre el negocio mediante un panel de chat de Genie integrado.

### Flujo de datos \{#data-flow\}

La aplicación combina cuatro primitivas de Databricks detrás de una única UI de React:

1. **SQL Warehouse** ejecuta queries analíticas (ingresos por destino, detalle de una reserva concreta) sobre las tablas precargadas `samples.wanderbricks.{bookings,properties,destinations,reviews}`. Las queries se definen en `config/queries/*.sql` y se ejecutan a través del plugin `analytics` de AppKit.
2. **Lakebase Postgres** almacena el estado gestionado por el operador en las tablas `app.booking_flags` y `app.booking_notes`. El servidor Express crea el schema y las tablas al arrancar y expone rutas CRUD para marcar reservas y añadir notas del agent.
3. **Genie Agent** («Wanderbricks») se configura sobre las tablas de reservas, propiedades y destinos. El plugin `genie` de AppKit integra un panel de chat para que los usuarios puedan preguntar sobre gasto, ocupación y valoraciones en lenguaje natural.
4. **Databricks App** lo une todo: un servidor Express + AppKit y un cliente Vite/React/Tailwind, desplegados mediante un Declarative Automation Bundle (antes Databricks Asset Bundle) que declara el SQL warehouse, el Genie Agent y la base de datos Lakebase como recursos de la aplicación.

### Qué adaptar \{#what-to-adapt\}

La configuración inicial, las variables de entorno y el despliegue del bundle están documentados en el archivo **`README.md`** del repositorio.

Para adaptar esta template a tu caso:

* **Datos de origen**: apunta los archivos SQL de analítica a tu propio catálogo y schema en lugar de `samples.wanderbricks.*`. Ajusta los joins para que se correspondan con tu modelo de reservas, propiedades y destinos.
* **SQL Warehouse**: define `sql_warehouse_id` en `databricks.yml` con el warehouse que quieres que consulte la aplicación.
* **Lakebase**: sustituye `postgres_branch` y `postgres_database` por tu propio project, branch y base de datos de Lakebase. Las tablas `app.booking_flags` y `app.booking_notes` se crean automáticamente en la primera ejecución.
* **Genie Agent**: crea un Genie Agent sobre tus tablas de reservas y define `genie_space_id` y `genie_space_name` en `databricks.yml`.
* **Terminología del dominio**: la UI gira en torno a los alquileres vacacionales (destinos, reservas, notas del agent). Para otras consolas de operaciones (logística, soporte, alianzas), renombra las rutas y los components y redirige las queries de analítica: el scaffolding de Lakebase + Genie + analítica se mantiene igual.