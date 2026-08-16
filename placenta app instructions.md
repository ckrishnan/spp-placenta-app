# Context and Instructions for LLM Agents and Parsers

**System Prompt / Developer Context:**
You are an expert AI assistant tasked with generating code, backend schemas (e.g., SQL, Firebase, Node.js), and frontend UI components for a clinical placental pathology reporting platform. This document serves as your absolute "Source of Truth." [cite_start]It contains the standardized recommendations from the Society for Pediatric Pathology (SPP) Placental Pathology Reporting Task Force[cite: 4]. 

When configuring the database schema or drafting application logic based on this document, adhere strictly to the disease-based hierarchy, the "Rule of 10s," the "2 of 3" abruption rules, and the exact verbiage for clinical comments detailed below. You must map all "Recommended Elements" to required database fields, and all "Optional Elements" to nullable or optional fields.

---

# Standardized Placental Pathology Reporting: Improving Quality and Clinical Utility
[cite_start]Recommendations from the Society for Pediatric Pathology Placental Pathology Reporting Task Force [cite: 3, 4]

## Authorship and Affiliations
* [cite_start]Sanjita Ravishankar MD (University Hospitals Cleveland Medical Center / Case Western Reserve) [cite: 94, 98]
* [cite_start]Francois Cady MD (CellNetix Pathology) [cite: 94, 100]
* [cite_start]Chrystalle Katte Carreon MD (Boston Children's Hospital / Harvard Medical School) [cite: 94, 103]
* [cite_start]Eumenia Castro MD (University of Wisconsin School of Medicine) [cite: 94, 107]
* [cite_start]Virginia E. Duncan MD (University of Alabama at Birmingham) [cite: 94, 111]
* [cite_start]Philip J. Katzman MD (University of Rochester Medical Center) [cite: 94, 111]
* [cite_start]Drucilla Roberts MD (Massachusetts General Hospital / Harvard Medical School) [cite: 94, 115]
* [cite_start]Karen K. Mestan MD (University of California San Diego) [cite: 94, 115]
* [cite_start]Cynthia Gyamfi-Bannerman MD (University of California San Diego) [cite: 94, 140]
* [cite_start]Heather Florescue MD (University of Rochester Medical Center) [cite: 94, 141]
* [cite_start]Lindsey Wimmer DNP (Star Legacy Foundation) [cite: 94, 143]
* [cite_start]Alicia Loehlein (Measure the Placenta) [cite: 94, 144]
* [cite_start]Mana Parast MD (University of California San Diego) [cite: 94, 145]

## Abstract
* [cite_start]**Background:** Placental pathology reporting continues to suffer from a lack of unified standards and difficulty applying the Amsterdam definitions to general clinical practice[cite: 185].
* [cite_start]**Methods:** A multidisciplinary Placental Pathology Reporting Task Force was formed to develop a standardized template based on literature review and consensus expert opinion, designed to complement the Amsterdam definitions[cite: 193]. [cite_start]The goal was to create a practical, succinct, clinically informative, and easily customizable template[cite: 194].
* [cite_start]**Results:** The template encompasses common placental pathologic diagnoses, providing recommended diagnostic terminology, explanatory comments, and practical tips[cite: 202].
* [cite_start]**Conclusions:** Widespread adoption of this framework will enhance the clinical utility and value of placental pathology reports by clinicians and patients[cite: 218].

## Introduction & Methods
* [cite_start]Placental pathology reports are read by obstetric providers, neonatologists, primary care physicians, patients, lawyers, and pathologists[cite: 309].
* [cite_start]The majority of placentas in the US are interpreted by general or gynecologic pathologists, not subspecialty-trained perinatal pathologists[cite: 314].
* [cite_start]The task force met monthly for one year starting in June 2024[cite: 392].
* [cite_start]The task force adhered to the Amsterdam consensus definitions when generating the template[cite: 464].

## Results: System Structure & Template Formatting
* [cite_start]The task force elected to adopt a disease-based, table-style format rather than a massive checklist[cite: 474, 475].
* [cite_start]The template serves as a "floor," not a "ceiling," setting an achievable minimum standard without restricting more detailed information[cite: 541].
* [cite_start]**Top-Line Category:** A general reporting structure was adopted with a "top line" diagnostic category (denoted with a "-"), and supporting specific histologic findings below it[cite: 542].
* [cite_start]**No Category Fit:** If placentas do not fall neatly into a diagnostic category, individual diagnoses should be listed as separate lines, ordered by severity at the pathologist's discretion[cite: 544, 545].

## Results: Diagnostic Categories and Definitions

### 1. Header Information
* [cite_start]**Recommended Elements:** Gestational age, placental weight, percentile or weight range (at minimum for <10th or >90th percentile), and completeness of the maternal surface (if incomplete)[cite: 552].
* [cite_start]**Optional Elements:** Mode of delivery, appropriateness of weight for normal range, and degree of histologic maturation[cite: 553].
* [cite_start]Weight percentiles should be as detailed as reference tables allow, as patient advocates value this[cite: 554, 618].

### 2. Significant Gross Findings
* [cite_start]Significant gross findings should be in the main body of the report[cite: 620].
* [cite_start]These include: succenturiate/accessory lobe, abnormal cord insertion (marginal and velamentous at minimum; peripheral optional), single umbilical artery, and umbilical cord abnormalities associated with fetal vascular malperfusion (long cord, hypercoiled cord, true knots)[cite: 621, 622].
* [cite_start]Hypocoiled umbilical cord may optionally be reported[cite: 623].
* [cite_start]If histologic findings of FVM are present, gross FVM findings can be placed under the FVM diagnostic line; otherwise, they are standalone[cite: 623, 624].

### 3. Acute Chorioamnionitis 
* [cite_start]The term "acute chorioamnionitis" is preferred over "ascending intrauterine infection" and "amniotic fluid infection" unless a specific organism is documented[cite: 626, 627].
* [cite_start]Must be staged and graded according to published criteria[cite: 628].
* [cite_start]A descriptive diagnosis should be included to aid clinical understanding, including localization and severity[cite: 632, 697].
* [cite_start]The presence of bacteria, Gram stain, and GMS stain results can be mentioned[cite: 698, 699].
* [cite_start]**Important Comment Rule:** If a placenta is sent for intra-amniotic infection and no chorioamnionitis is found, a comment must note the lack of significant acute inflammation[cite: 699].

### 4. Chronic Inflammatory Lesions
* [cite_start]Preferred terminology is "chronic inflammatory lesions"[cite: 706].
* [cite_start]"Villitis of unknown etiology" (VUE) should only be used if additional workup excluded infectious etiologies[cite: 706, 707].
* [cite_start]Chronic villitis must be graded as high or low grade with focality/distribution described[cite: 708].
* [cite_start]Other entities under this header: basal chronic villitis, chronic chorioamnionitis, lymphoplasmacytic deciduitis/plasma cell deciduitis, eosinophilic/T-cell chorionic vasculitis, chorionic histiocytic hyperplasia[cite: 708, 709].
* [cite_start]Lymphoplasmacytic deciduitis requires definitive plasma cells or diffuse chronic inflammation[cite: 709].
* [cite_start]**Important Comment Rule:** A comment reflecting increased risk of adverse outcomes and recurrence is recommended for chronic villitis[cite: 711, 712].
* [cite_start]Routine immunohistochemistry for infection is not recommended unless suggested by histology (e.g., plasma cells in villous stroma)[cite: 705, 715].

### 5. Maternal Vascular Malperfusion (MVM)
* [cite_start]Diagnoses under this header: accelerated villous maturation, distal villous hypoplasia, villous agglutination, villous infarct, villous infarction hematoma, and decidual arteriopathy[cite: 718].
* [cite_start]Increased syncytial knots and focally increased perivillous/intervillous fibrin should be reported under accelerated villous maturation[cite: 719].
* [cite_start]Reporting membranous laminar decidual necrosis and chorion laeve pseudocysts is optional[cite: 720].
* [cite_start]If abruption occurs in the context of MVM, it should be placed under the MVM header[cite: 722].

### 6. Fetal Vascular Malperfusion (FVM)
* [cite_start]Inclusion of gross supportive findings (umbilical cord lesions at risk) under the FVM header is recommended[cite: 726].
* [cite_start]Vascular ectasia is *not* included due to high risk of overdiagnosis as an artifact[cite: 727].
* [cite_start]Increased fetal nucleated red blood cells should be reported separately, as they are non-specific[cite: 727].

### 7. Acute Abruption
* [cite_start]Findings include retroplacental hematoma (with/without parenchymal compression, villous infarction, intravillous hemorrhage)[cite: 728].
* [cite_start]Loosely attached blood clots on the maternal surface alone do not equal abruption[cite: 729].
* [cite_start]Acute central, acute marginal, and subacute central abruption are all subsumed under "Acute Abruption"[cite: 731].
* [cite_start]**Important Comment Rule:** If sent for abruption but pathology is negative, include a comment that the diagnosis is not excluded and is best made by the clinician at delivery[cite: 733, 734].

### 8. Chronic Marginal Abruption (The "2 of 3" Rule)
* Requires at least TWO of three findings to utilize the header:
  1. [cite_start]Circumvallate membrane insertion[cite: 738].
  2. [cite_start]Remote marginal retroplacental hematoma (organized/layered/adhered blood at the margin)[cite: 738, 741].
  3. [cite_start]Chorioamniotic hemosiderosis[cite: 738].
* [cite_start]If only one is present, list as a separate, isolated diagnosis[cite: 739].

### 9. Basal Plate Myometrial Fibers (BPMF)
* [cite_start]Used for Placenta Accreta Spectrum (PAS) staging[cite: 745].
* [cite_start]**Important Comment Rule:** A comment is recommended for placentas submitted for suspected PAS that lack identifiable BPMF[cite: 747]. [cite_start]Stage 2 (absence of decidua) may support non-invasive PAS[cite: 749, 976].

### 10. Increased Fetal Nucleated Red Blood Cells (NRBCs)
* [cite_start]Associated with fetal stress, chronic anemia, and maternal diabetes[cite: 750, 751].
* [cite_start]**Threshold Definition:** At least one NRBC per 40x field in fetal capillaries[cite: 751].
* [cite_start]Minimum gestational age of 22 weeks is recommended for this cutoff[cite: 755].

### 11. Intervillous Thrombus
* [cite_start]Laminated space-occupying lesions in the intervillous space, pushing villi away[cite: 755, 756].
* [cite_start]Standalone diagnosis[cite: 758].
* [cite_start]Multiple fresh thrombi may support feto-maternal hemorrhage in the right clinical context (Kleihauer-Betke test)[cite: 758, 759].

### 12. Villous Edema
* **Patchy:** "Swiss cheese-like" spaces, floating Hofbauer cells, lifting syncytiotrophoblast. [cite_start]Non-specific, standalone diagnosis[cite: 761, 762].
* **Diffuse (Hydrops Placentalis):** Involves both proximal and distal villi, associated with hydrops fetalis. [cite_start]Render only with appropriate clinical context[cite: 763, 765].

### 13. Meconium
* Gross: green staining. [cite_start]Micro: reactive amniocytes, meconium-laden macrophages progressing to meconium-associated vascular necrosis (MAVN)[cite: 766, 767].
* [cite_start]**Important Comment Rule:** MAVN is associated with adverse outcomes; include a comment and notify the pediatrician[cite: 767, 768].
* [cite_start]Do not attempt to estimate the timing of meconium exposure[cite: 772].
* [cite_start]Without documented clinical history of meconium fluid, do not use the phrase "consistent with meconium" for pigment-laden macrophages (hemosiderin/lipofuscin are mimics)[cite: 773, 774].

### 14. Villous Capillary Lesions
* [cite_start]**Chorangiosis (Rule of 10s):** >10 capillaries per villus in 10 or more distal villi in several regions[cite: 774]. [cite_start](Practically, villi with 20+ capillaries indicate chorangiosis [cite: 776]).
* [cite_start]**Chorangiomatosis:** Multiple foci of stem/immature intermediate villi with an anastomosing network of small vessels[cite: 777].
* [cite_start]**Chorangioma:** Benign nodular vascular lesion; report maximum dimension[cite: 779, 780].

### 15. Perivillous Fibrin
* [cite_start]Evaluated via Katzman and Genest system[cite: 785].
* [cite_start]**Focal:** <25% involvement[cite: 785].
* [cite_start]**Borderline Massive (MPVFD):** 25-50% involvement[cite: 786].
* [cite_start]**Massive (MPVFD):** >50% involvement[cite: 786].
* [cite_start]**Maternal Floor Infarction (MFI):** Band of fibrin encasing the basal plate >= 3mm thick on at least one slide[cite: 787].
* [cite_start]**Important Comment Rule:** MPVFD and MFI carry high risk of recurrence; a comment must accompany these diagnoses[cite: 789]. [cite_start]Also described in SARS-CoV-2 placentitis[cite: 791].

### 16. Chronic Histiocytic Intervillositis (CHI)
* [cite_start]Infiltration of monocyte-macrophages in the intervillous space without significant chronic villitis[cite: 791].
* [cite_start]Associated with adverse outcomes and increased recurrence risk; an explanatory comment is required[cite: 792, 793].
* [cite_start]Do not render this diagnosis if infectious etiologies (malaria, SARS-CoV-2) are present[cite: 795].

### 17. Delayed Villous Maturation (DVM) & Villous Dysmaturity
* **DVM:** Immature appearance, monotonous, reduced vasculosyncytial membranes, centrally placed capillaries. [cite_start]Limit diagnosis to >36 weeks gestation [cite: 797-799]. [cite_start]Graded as Focal (1 slide) vs. Diffuse (>=2 slides)[cite: 798].
* [cite_start]**Villous Dysmaturity:** Defined specifically as DVM pattern with increased syncytial knots[cite: 801]. [cite_start]Associated with maternal diabetes and elevated BMI[cite: 802].

### 18. Intrauterine Fetal Demise (IUFD)
* [cite_start]**Important Comment Rule:** An explanatory comment must be included in all placentas received for IUFD, even if no cause is found[cite: 805].
* [cite_start]Note presence or absence of involutional changes to suggest timing[cite: 806].
* [cite_start]Differentiate from FVM: FVM has spatial heterogeneity, IUFD has uniform parenchymal involution[cite: 807, 808].

### 19. Sickled Red Blood Cells
* [cite_start]May be seen in mothers with sickle cell disease/trait[cite: 813].
* [cite_start]A comment may be included and the clinician notified to prompt work-up[cite: 814].

<<<<<<< HEAD
### 20. Twins
* [cite_start]Chorionicity is the most important element to report[cite: 815].
* [cite_start]If dichorionic, state whether fused or separate[cite: 816].
* [cite_start]Report the presence or absence of a dividing membrane and anastomoses[cite: 816, 817].
* [cite_start]Note any gross asymmetries or abnormalities[cite: 818].

### 21. Normal
=======
### 20. Normal
>>>>>>> 623cc51 (please review the placenta app instructions md file)
* [cite_start]If no abnormalities are found, include all header elements followed by a line reflecting the lack of identifiable abnormalities[cite: 821].
* [cite_start]If sent for specific indications (abruption, PAS), include comments noting their absence[cite: 822].

## Discussion & Turnaround Times (TAT)
* [cite_start]**Routine TAT Goal:** 3-4 days[cite: 832, 833].
* [cite_start]**Urgent TAT Goal (Sick mother/neonate):** 2 days[cite: 833].

---

## TABLES & FULL TEMPLATE MAPPING

### [cite_start]Table 1: Template for Reporting of Placental Pathology [cite: 944, 951-1011]

**Header**
* [cite_start]*Recommended:* Gestational age, Weight, Percentile/weight range (if <10th or >90th), Completeness of maternal surface (if incomplete)[cite: 951].
* [cite_start]*Optional:* Mode of delivery, Appropriateness of weight, Histologic maturation[cite: 951].

**Significant Gross Findings**
* *Recommended:* Abnormal cord insertion (marginal, velamentous, furcate), Accessory lobe, Single umbilical artery, UC abnormalities associated with FVM (long cord, hypercoiled, true knot). (List under FVM header if FVM diagnosed, else list here) [cite_start][cite: 952].
* [cite_start]*Optional:* Hypocoiled UC, Peripheral insertion of UC[cite: 952].

**Acute Chorioamnionitis**
* [cite_start]*Verbiage:* -- Acute [necrotizing] chorioamnionitis/chorionitis/subchorionitis [with fetal inflammatory response in umbilical vein/arteries/chorionic plate vessels]: Maternal inflammatory response, stage _, grade _, Acute chorioamnionitis, Fetal inflammatory response, stage _, grade _[cite: 952].
* *Recommended:* Descriptive diagnosis in addition to stage and grade. [cite_start]Comment for no ACA in placenta sent for IAI: "No significant acute inflammation is identified."[cite: 952].
* [cite_start]*Optional:* Presence of bacteria, Gram stain/GMS results[cite: 953].

**Chronic Inflammatory Lesions**
* *Verbiage:* -- Chronic inflammatory lesions[, see comment]: [Extent, grade] chronic villitis [with/without intervillositis] [with stem vessel obliteration/with associated avascular villi]. Basal chronic villitis. Chronic chorioamnionitis. Lymphoplasmacytic deciduitis/plasma cell deciduitis. Eosinophilic/T-cell chorionic vasculitis. [cite_start]Chorionic histiocytic hyperplasia[cite: 954, 955, 957, 958].
* [cite_start]*Recommended Comments:* * *High grade chronic villitis:* "[The pattern of inflammation... is most consistent with a villitis of unknown etiology (VUE)...] Chronic villitis/VUE, (particularly when associated with avascular villi and perivillous fibrin deposition) has been associated with adverse perinatal outcomes, including fetal growth restriction, and can recur in 10-15% of subsequent pregnancies. Clinical correlation is recommended."[cite: 954, 955].
  * [cite_start]*Eo/T-cell chorionic vasculitis:* "Eosinophilic/T-cell chorionic vasculitis is of unclear clinical significance unless it is associated with a thrombus."[cite: 956].
  * If concern for infection, perform IHC. [cite_start]If negative, note concern in comment[cite: 959].

**Maternal Vascular Malperfusion (MVM)**
* *Verbiage:* -- Maternal vascular malperfusion lesions: Accelerated villous maturation. Distal villous hypoplasia. Villous agglutination. Villous infarct [include size, extent]. Villous infarction hematoma. [cite_start]Decidual arteriopathy [mural hypertrophy/fibrinoid necrosis/acute atherosis/chronic perivasculitis/absence of spiral artery remodeling/arterial thrombosis/persistence of endovascular trophoblast in the third trimester][cite: 960, 961, 963].
* [cite_start]*Optional:* Membranous laminar decidual necrosis, Chorion laeve pseudocysts[cite: 962].

**Fetal Vascular Malperfusion (FVM)**
* *Verbiage:* -- Fetal vascular malperfusion lesions [low grade/high grade]: Long umbilical cord [_ cm]/hypercoiled umbilical cord/true knot of umbilical cord. [Occlusive/non-occlusive] thrombus, [chorionic plate/stem] vessel[s]. Intramural fibrin deposition, [chorionic plate/stem] vessel[s]. [Small/intermediate sized/large] foc[us/i] of [avascular villi/villous stromal-vascular karyorrhexis]. [cite_start]Stem vessel obliteration[cite: 964, 965, 966].

**Acute Abruption**
* *Verbiage:* -- Findings consistent with [clinical impression of] acute placental abruption: Retroplacental hematoma [with parenchymal compression][with overlying villous infarction]. [cite_start]Intravillous hemorrhage[cite: 967, 968].
* [cite_start]*Recommended Comment (if sent for suspicion but no findings):* "Although there is no evidence of abruption on pathologic examination of this placenta, the diagnosis is not excluded. The diagnosis of abruption is best made by the clinician at the time of delivery."[cite: 968, 969].

**Chronic Marginal Abruption**
* *Verbiage:* -- Findings consistent with [clinical impression of] chronic marginal abruption: Chorioamniotic hemosiderosis. Remote marginal retroplacental hematoma. [cite_start]Circumvallate membrane insertion[cite: 970, 972].
* [cite_start]*Recommended Comment:* (Same as acute abruption missing findings)[cite: 970, 971].

**Basal Plate Myometrial Fibers**
* [cite_start]*Verbiage:* -- Basal plate myometrial fibers, [focal/multifocal], [longest length], [highest stage 1/2], see comment[cite: 979].
* [cite_start]*Recommended Comments:* * "Adherent basal plate myometrial fibers (BPMF) are staged according to the Placenta Accreta Spectrum (PAS) Task Force criteria according to the presence (Stage 1) or absence (Stage 2) of intervening decidua. Stage 1 BPMF may be an incidental finding. Stage 2 BPMF may support a diagnosis of non-invasive PAS and may be associated with clinically significant PAS in future pregnancies."[cite: 975, 976].
  * [cite_start]*If suspected but absent:* "The clinical concern for placenta accreta spectrum is noted. [The basal plate is disrupted, possibly incomplete, however] no basal plate myometrial fibers are identified."[cite: 980, 981].

**Increased Fetal NRBCs**
* [cite_start]*Verbiage:* -- Increased fetal nucleated red blood cells[cite: 982].

**Intervillous Thrombus**
* [cite_start]*Verbiage:* -- Intervillous thrombus/i[cite: 983].

**Patchy / Diffuse Villous Edema**
* *Verbiage:* -- Patchy villous edema. [cite_start]/ -- Diffuse villous edema, consistent with hydrops placentalis[cite: 984, 985].

**Meconium**
* *Verbiage:* -- Green stained placenta, grossly consistent with meconium exposure. -- Pigment [laden macrophages] in membranes/chorionic plate/chorionic vessel walls [, consistent with meconium – if clinicians give history of MSF]. -- Mild umbilical vasculitis/chorionic vasculitis [, consistent with meconium - if clinicians give history of MSF]. [cite_start]-- Meconium associated vascular necrosis[cite: 986, 987].
* [cite_start]*Recommended Comment:* "Meconium associated myonecrosis of umbilical and/or chorionic vessels may be associated with significant adverse perinatal outcomes."[cite: 987].

**Villous Capillary Lesions**
* *Verbiage:* -- Chorangiosis. -- Chorangiomatosis. [cite_start]-- Chorangioma[cite: 988].

**Perivillous Fibrin**
* *Verbiage:* -- Perivillous fibrin plaque/focally increased perivillous fibrin. -- Borderline increased perivillous fibrin. -- Massive perivillous fibrin deposition, see comment. [cite_start]-- Maternal floor infarct, see comment[cite: 989, 990].
* [cite_start]*Recommended Comment (MPVFD/MFI):* "Massive perivillous fibrin deposition/maternal floor infarct is associated with significant perinatal morbidity and mortality, a high recurrence rate in future pregnancies and maternal thrombophilia/anti-phospholipid syndrome and autoimmune disorders. [It can also be rarely associated with infections...] Referral of the mother to maternal-fetal medicine prior to next pregnancy should be considered."[cite: 990, 991].

**Chronic Histiocytic Intervillositis**
* [cite_start]*Verbiage:* -- Chronic histiocytic intervillositis, see comment[cite: 993].
* [cite_start]*Recommended Comment:* "Chronic histiocytic intervillositis is associated with adverse pregnancy outcomes, including fetal growth restriction [and stillbirth]. [Can mention elevated serum alkaline phosphatase if present]. There is an increased risk of recurrence in future pregnancies of up to 80%. Clinical correlation and appropriate follow-up are recommended. Referral of the mother to maternal-fetal medicine prior to next pregnancy should be considered."[cite: 994, 995, 996, 997].

**Delayed Villous Maturation / Dysmaturity**
* *Verbiage:* -- Delayed villous maturation, [focal/diffuse]. [cite_start]/ -- Villous dysmaturity (delayed villous maturation with increased syncytial knots), see comment[cite: 998].
* [cite_start]*Recommended Comment:* "The villi demonstrate morphologic changes that include a mixture of delayed and accelerated maturation. These changes are associated with maternal diabetes and elevated BMI."[cite: 999, 1000].

**Intrauterine Fetal Demise (IUFD)**
* [cite_start]*Verbiage:* -- Involutional changes of intrauterine fetal demise[cite: 1001].
* [cite_start]*Recommended Comments:* Include a comment for every IUFD, noting presence/absence of involutional changes[cite: 1001]. [cite_start]If no findings to explain IUFD: "Based on isolated gross and histologic review of the placenta, a cause of demise could not be established."[cite: 1003].

**Specific Infections / Sickled RBCs**
* *Verbiage:* -- Findings consistent with [infection] placentitis. [cite_start]-- Funisitis with fungal organisms, morphologically consistent with Candida funisitis[cite: 1004].
* [cite_start]*Optional Comment for Sickled RBCs:* "Sickling of maternal red blood cells is present. Appropriate tests for hemoglobinopathy are recommended if not already performed."[cite: 1005, 1006].

<<<<<<< HEAD
**Twins**
* [cite_start]*Verbiage:* -- [Dichorionic-diamniotic/Monochorionic-diamniotic/Monochorionic-monoamniotic] twin placenta [with fused/separate discs], [with/without] vascular anastomoses, [with/without] gross asymmetries.[cite: 1007, 1008].
* [cite_start]*Recommended Comment:* A comment describing any specific findings related to the twin gestation is recommended, such as features of twin-twin transfusion syndrome.[cite: 1008].

=======
>>>>>>> 623cc51 (please review the placenta app instructions md file)
---

### [cite_start]Table 2: Grading and Staging of Acute Chorioamnionitis [cite: 1012-1015]

| Stage/Grade | Maternal Inflammatory Response Definition | Fetal Inflammatory Response Definition |
| :--- | :--- | :--- |
| **Stage 1** | [cite_start]**Acute subchorionitis or chorionitis:** Neutrophils in the subchorionic fibrin layer in the chorionic plate or chorion in the extraplacental membranes[cite: 1012]. | [cite_start]**Chorionic vasculitis and/or umbilical phlebitis:** Intramural neutrophils in the chorionic plate vessels and/or umbilical vein[cite: 1012]. |
| **Stage 2** | [cite_start]**Acute chorioamnionitis:** Neutrophils within the chorion and amnion; may accumulate between the epithelial layers[cite: 1013]. | [cite_start]**Umbilical arteritis and phlebitis or panvasculitis:** Intramural neutrophils in one or both umbilical arteries with or without involvement of umbilical vein[cite: 1013]. |
| **Stage 3** | [cite_start]**Necrotizing acute chorioamnionitis:** Neutrophils within the chorion and amnion with associated amniocyte necrosis and/or amnion basement membrane hypereosinophilia[cite: 1013]. | [cite_start]**Necrotizing funisitis:** Neutrophils with necrotic debris in concentric arcs/bands around one or more umbilical vessels[cite: 1013]. |
| **Grade 1** | No special terminology. [cite_start]Not severe as defined[cite: 1013]. | No special terminology. [cite_start]Not severe as defined[cite: 1013]. |
| **Grade 2** | [cite_start]**Severe acute chorioamnionitis:** Confluent neutrophils (greater than 10x20 cells) as a continuous band, or with subchorionic microabscesses[cite: 1014]. | [cite_start]**Severe fetal inflammatory response:** Near-confluent intramural neutrophils with attenuation or degeneration of the vascular smooth muscle[cite: 1014]. |

---

### [cite_start]Table 3: Grading of Chronic Villitis [cite: 1016]

| Grade / Extent | Definition |
| :--- | :--- |
| **Low Grade** | [cite_start]At least 2 foci of villitis, with all foci involving <10 contiguous villi[cite: 1016]. |
| **High Grade** | [cite_start]Multiple foci of villitis, on more than one section, at least one of which involves >10 contiguous villi[cite: 1016]. |
| **Focal** | [cite_start]One slide involved[cite: 1016]. |
| **Multifocal** | [cite_start]Multiple slides involved[cite: 1016]. |
| **Patchy** | [cite_start]<30% of all distal villi involved[cite: 1016]. |
| **Diffuse** | >[cite_start]30% of all distal villi involved[cite: 1016]. |
| **Ungradable (possible low)**| [cite_start]Single focus of villitis involving <10 contiguous villi[cite: 1016]. |
| **Ungradable (possible high)**| [cite_start]Single focus of villitis involving >10 contiguous villi[cite: 1016]. |

---

### [cite_start]Table 4: Umbilical Cord Lesions at Risk [cite: 1018]

| Pathologically Observable Conditions | Potentially Obstructing Clinical Conditions |
| :--- | :--- |
| [cite_start]Long umbilical cord (>70 cm) [cite: 1018] | [cite_start]Umbilical cord entanglement (nuchal, body cord) [cite: 1018] |
| [cite_start]True knot [cite: 1018] | [cite_start]Umbilical cord prolapse [cite: 1018] |
| [cite_start]Hypercoiled umbilical cord (>3-4 coils/10 cm) [cite: 1018] | [cite_start]Lateral compression (oligohydramnios, submucosal leiomyoma) [cite: 1018] |
| [cite_start]Stricture [cite: 1018] | |
| [cite_start]Marginal/velamentous/furcate insertion of umbilical cord [cite: 1018] | |
| [cite_start]Thin umbilical cord (<8 mm at term) [cite: 1018] | |
| [cite_start]Tethered umbilical cord (tight amniotic web) [cite: 1018] | |
