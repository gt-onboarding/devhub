Completa primero estos templates de requisitos previos:

* [Configura tu entorno de desarrollo local](/templates/set-up-your-local-dev-environment) — instala el CLI de Databricks y autentica un perfil.
* [Consulta endpoints de modelos fundacionales](/templates/foundation-models-api) — confirma que tu workspace expone un endpoint de chat de modelo fundacional alojado en Databricks.

Después, verifica que estas funcionalidades del workspace de Databricks estén habilitadas. Si alguna comprobación falla, pide al administrador de tu workspace que habilite la funcionalidad.

* **Un endpoint de chat compatible con OpenAI en Model Serving.** Ejecuta `databricks serving-endpoints list --profile <PROFILE>` y confirma que aparezca al menos un endpoint de chat compatible con OpenAI (por ejemplo, `databricks-gpt-5-4-mini`, `databricks-meta-llama-3-3-70b-instruct` o `databricks-claude-sonnet-4-6`). La disponibilidad de endpoints varía según el workspace y la región; anota el que vayas a definir como `DATABRICKS_ENDPOINT`.
* **Databricks Apps habilitado.** Ejecuta `databricks apps list --profile <PROFILE>` y confirma que el comando se ejecute correctamente (una lista vacía es válida). Un error de permisos o de `not enabled` significa que Apps no está disponible para esta identidad en este workspace.