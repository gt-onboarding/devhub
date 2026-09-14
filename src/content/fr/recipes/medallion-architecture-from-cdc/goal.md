Une fois l&#39;opération terminée, vous disposerez de :

* Une couche bronze fournie par les tables d&#39;historique Change Data Feed de Lakebase en amont (entrée de cette recette)
* Une couche argent avec des vues matérialisées dédupliquées reflétant l&#39;état courant de chaque entité
* Une couche or avec des agrégations et des métriques métier sous forme de vues matérialisées
* Un Lakeflow Spark Declarative Pipeline planifié qui actualise les couches argent et or de manière incrémentielle
* Toutes les couches interrogeables en tant que tables Unity Catalog via SQL, Spark, les outils de BI et Genie