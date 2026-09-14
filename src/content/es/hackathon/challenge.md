## Prompt \{#prompt\}

Se te entregan 10.000 registros desordenados de facilities sanitarias de toda la India. Cada registro incluye campos estructurados, como ubicación y especialidades, además de descripciones en texto libre, de calidad irregular, sobre las capacidades, procedimientos, equipamiento y servicios que declaran ofrecer.

Crea una Databricks App que ayude a un planificador sanitario, a un coordinador de una ONG o a un analista sin perfil técnico a convertir estos datos desordenados en decisiones fiables.

Tu aplicación debe extraer estructura útil de los registros, mostrar la evidencia que respalda sus conclusiones, comunicar la incertidumbre con honestidad y permitir que los usuarios guarden o revisen su trabajo.

## Requisitos básicos \{#core-requirements\}

Tu propuesta debe:

* Ejecutarse como una Databricks App en Free Edition.
* Usar el dataset de facilities proporcionado.
* Admitir un workflow claro para usuarios no técnicos.
* Citar el texto de la facility en el que se basa cualquier afirmación, recomendación, puntuación o clasificación relevante.
* Comunicar la incertidumbre en lugar de presentar evidencia débil como un hecho.
* Conservar las acciones del usuario, como notas, anulaciones, shortlists, escenarios o decisiones de revisión.

## Dataset \{#dataset\}

El dataset proporcionado contiene 10.000 registros de facilities de salud de la India y 51 columnas.

Todos los registros incluyen el nombre de la facility, el estado, la ciudad, la latitud, la longitud, las especialidades controladas, una descripción y las URL de origen; 9.996 registros incluyen código postal. Los campos de evidencia extraídos son ruidosos, repetitivos y de respaldo desigual:

| Campo           | Cobertura |
| --------------- | --------- |
| description     | 100%      |
| capability      | 99,7%     |
| procedure       | 92,5%     |
| equipment       | 77,0%     |
| numberDoctors   | 36,4%     |
| capacity        | 25,2%     |
| yearEstablished | 47,8%     |

Hay evidencia útil repartida entre description, capability, procedure, equipment, specialties y source&#95;urls. Los equipos deben tratar estos campos como claims por verificar, no como verdad absoluta.

## Elige una categoría \{#pick-one-track\}

### Categoría 1: Facility Trust Desk \{#track-1-facility-trust-desk\}

Pregunta: ¿puede esta facility hacer realmente lo que afirma?

Crea una aplicación que evalúe los claims de las facilities sobre capacidades como UCI, maternidad, urgencias, oncología, traumatología o UCIN. Para cada facility y capacidad, genera una señal de confianza: evidencia sólida, evidencia parcial, evidencia débil o sospechosa, o ausencia de claim.

Workflow mínimo: un planificador selecciona una capacidad y una región, ve las facilities ordenadas por relevancia, despliega una facility para revisar las citas y puede anular la evaluación añadiendo una nota.

### Categoría 2: Medical Desert Planner \{#track-2-medical-desert-planner\}

Pregunta: ¿Dónde están las brechas asistenciales de mayor riesgo y qué tan seguros estamos de que esas brechas son reales?

Crea una aplicación que agregue evidencia de facilities ponderada por confianza a lo largo de una geografía: estado, ciudad, distrito o código postal. Ayuda a los planificadores a distinguir las brechas reales de atención de las regiones con escasez de datos.

Workflow mínimo: el planificador selecciona una capacidad y una geografía, consulta la cobertura regional, profundiza en los registros de facilities que respaldan un agregado y guarda un escenario de planificación.

### Categoría 3: Referral Copilot \{#track-3-referral-copilot\}

Pregunta: ¿A dónde debería acudir realmente un paciente o un coordinador?

Crea una aplicación en la que el usuario introduzca una ubicación y una necesidad asistencial, como «diálisis cerca de Jaipur» o «cirugía de urgencia cerca de Patna», y obtenga una shortlist de facilities candidatas con la evidencia adjunta.

Workflow mínimo: entran ubicación y necesidad; salen candidatos ordenados por relevancia; cada candidato muestra la distancia, la evidencia coincidente y la evidencia faltante o dudosa, y puede guardarse en una shortlist.

### Categoría 4: Data Readiness Desk \{#track-4-data-readiness-desk\}

Pregunta: ¿Qué hay que corregir antes de poder confiar en este dataset para la planificación?

Crea una aplicación para perfilar, revisar y mejorar el dataset de facilities. Saca a la luz contradicciones, claims sospechosos, campos poco poblados y registros de alto impacto que requieran revisión humana.

Workflow mínimo: mostrar los problemas de completitud y calidad, ofrecer una cola de revisión de los registros marcados y conservar las decisiones de los revisores para su uso posterior.