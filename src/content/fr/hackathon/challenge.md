## Prompt \{#prompt\}

Vous disposez de 10 000 enregistrements hétérogènes d&#39;établissements de santé répartis dans toute l&#39;Inde. Chaque enregistrement comprend des champs structurés, comme la localisation et les spécialités, ainsi que des descriptions en texte libre de qualité inégale portant sur les capacités revendiquées, les actes pratiqués, les équipements et les services.

Créez une Databricks App qui aide un planificateur de santé non technique, un coordinateur d&#39;ONG ou un analyste à transformer ces données brutes en décisions fiables.

Votre application doit extraire une structure exploitable à partir des enregistrements, présenter les éléments qui étayent ses conclusions, communiquer honnêtement les incertitudes et permettre aux utilisateurs d&#39;enregistrer ou de réviser leur travail.

## Exigences fondamentales \{#core-requirements\}

Votre soumission doit :

* S&#39;exécuter en tant que Databricks App sur la Free Edition.
* Utiliser le jeu de données d&#39;établissements fourni.
* Offrir un flux de travail utilisateur clair pour un public non technique.
* Citer le texte source de l&#39;établissement pour toute affirmation, recommandation, note ou classement important.
* Faire état des incertitudes plutôt que de présenter des indices fragiles comme des faits établis.
* Conserver les actions de l&#39;utilisateur : notes, remplacements manuels, listes restreintes, scénarios ou décisions de revue.

## Dataset \{#dataset\}

Le dataset fourni contient 10 000 enregistrements d&#39;établissements de santé indiens et 51 colonnes.

Tous les enregistrements comportent le nom de l&#39;établissement, l&#39;État, la ville, la latitude, la longitude, les spécialités contrôlées, une description et des URL sources ; 9 996 enregistrements incluent un code postal. Les champs d&#39;informations extraits sont bruités, répétitifs et renseignés de façon inégale :

| Champ           | Couverture |
| --------------- | ---------- |
| description     | 100 %      |
| capability      | 99,7 %     |
| procedure       | 92,5 %     |
| equipment       | 77,0 %     |
| numberDoctors   | 36,4 %     |
| capacity        | 25,2 %     |
| yearEstablished | 47,8 %     |

Des informations utiles figurent dans description, capability, procedure, equipment, specialties et source&#95;urls. Les équipes doivent traiter ces champs comme des affirmations à vérifier, et non comme des données de référence.

## Choisissez un parcours \{#pick-one-track\}

### parcours 1 : bureau de confiance des établissements \{#track-1-facility-trust-desk\}

Question : cet établissement est-il réellement en mesure de faire ce qu&#39;il affirme ?

Créez une application qui évalue les prestations déclarées par les établissements pour des capacités telles que les soins intensifs, la maternité, les urgences, l&#39;oncologie, la traumatologie ou la néonatalogie. Pour chaque établissement et chaque capacité, produisez un signal de confiance : preuves solides, preuves partielles, preuves faibles ou suspectes, ou absence de déclaration.

Flux de travail minimal : un planificateur sélectionne une capacité et une région, consulte les établissements classés, déplie un établissement pour en examiner les sources et peut remplacer l&#39;évaluation par une note.

### Parcours 2 : planificateur de déserts médicaux \{#track-2-medical-desert-planner\}

Question : où se situent les lacunes de soins les plus critiques, et dans quelle mesure sommes-nous sûrs qu&#39;elles sont réelles ?

Créez une application qui agrège des données probantes sur les établissements, pondérées par niveau de confiance, à différentes échelles géographiques : État, ville, district ou code postal. Aidez les planificateurs à distinguer les véritables lacunes de soins des régions simplement pauvres en données.

Flux de travail minimal : un planificateur sélectionne une capacité et une zone géographique, visualise la couverture régionale, explore en détail les fiches d&#39;établissement qui sous-tendent un agrégat, puis enregistre un scénario de planification.

### parcours 3 : copilote d&#39;orientation \{#track-3-referral-copilot\}

Question : où un patient ou un coordinateur doit-il réellement se rendre ?

Créez une application dans laquelle l&#39;utilisateur saisit un lieu et un besoin de soins, par exemple « dialyse près de Jaipur » ou « chirurgie d&#39;urgence près de Patna », et obtient une liste restreinte d&#39;établissements candidats, justificatifs à l&#39;appui.

Flux de travail minimal : lieu et besoin en entrée ; candidats classés en sortie ; chaque candidat affiche la distance, les éléments probants correspondants, les éléments manquants ou douteux, et peut être ajouté à une liste restreinte.

### parcours 4 : Data Readiness Desk \{#track-4-data-readiness-desk\}

Question : que faut-il corriger avant de pouvoir se fier à ce dataset pour la planification ?

Créez une application permettant de profiler, de relire et d&#39;améliorer le dataset des établissements. Faites ressortir les contradictions, les affirmations douteuses, les champs peu renseignés et les enregistrements à fort impact qui nécessitent une relecture humaine.

Flux de travail minimal : afficher les problèmes de complétude et de qualité, proposer une file de relecture des enregistrements signalés et conserver les décisions des relecteurs pour une utilisation en aval.