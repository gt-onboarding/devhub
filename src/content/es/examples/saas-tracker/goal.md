Este template muestra una herramienta CRUD interna sencilla creada sobre Databricks: un registro de suscripciones SaaS donde los equipos anotan las herramientas que usan, quién es responsable de cada suscripción, cuánto cuesta y cuándo se renueva. Un Genie Agent ofrece analítica de autoservicio sobre los datos de suscripciones.

### Flujo de datos \{#data-flow\}

Todos los datos de suscripciones residen en una única tabla de Lakebase Postgres y se sirven directamente a la app:

1. **Lakebase Postgres** almacena la tabla `saas_tracker.subscriptions` con el nombre, el proveedor, el costo, el ciclo de facturación, el responsable, el estado y las fechas de renovación.
2. La **SaaS Tracker App** (Databricks App) lee y escribe suscripciones mediante rutas de API de Express respaldadas por Lakebase.
3. Las **queries del SQL Warehouse** alimentan el dashboard de analítica (resumen de gasto, gasto por categoría).
4. Un **Genie Agent** configurado sobre la tabla de suscripciones permite a los usuarios hacer preguntas en lenguaje natural sobre gasto, responsables y renovaciones.

### Qué adaptar \{#what-to-adapt\}

La configuración y el aprovisionamiento están documentados en el **`README.md`** del repositorio.

Para adaptar este template a tus necesidades:

* **Lakebase**: apunta el `databricks.yml` de la app a tu propio project, branch y base de datos de Lakebase.
* **SQL Warehouse**: define el ID del warehouse que ejecutará las queries de analítica.
* **Genie Agent**: crea un Genie Agent sobre la tabla `saas_tracker.subscriptions` y define el ID del space.
* **Categorías**: ajusta la lista de categorías en las rutas del servidor y en el component del formulario para que coincida con los departamentos de tu organización.
* **Datos iniciales**: el script de inicialización crea 18 suscripciones de demo realistas. Sustitúyelas por tus propios datos o usa el formulario de alta de la app.