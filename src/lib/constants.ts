import React from 'react';
import type { ImagePlaceholder } from './placeholder-images';
import { PlaceHolderImages } from './placeholder-images';
import { Layers, Leaf, User, Milestone, Bug } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const imageMap = new Map(PlaceHolderImages.map(img => [img.id, img]));

const CordIcon = () => (
    React.createElement('svg', {
        xmlns: "http://www.w3.org/2000/svg",
        width: "1em",
        height: "1em",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "2",
        strokeLinecap: "round",
        strokeLinejoin: "round",
        className: "lucide lucide-cable"
    },
    React.createElement('path', { d: "M6 7h12" }),
    React.createElement('path', { d: "M18 7c0 2.5-3.5 8-7 8s-7-5.5-7-8" }),
    React.createElement('path', { d: "M10 15c0 2.5 1.5 7 4 7s4-4.5 4-7" }),
    React.createElement('path', { d: "M6 21V7" }),
    React.createElement('path', { d: "M18 21V7" })
    )
);

export const injuryPatterns = {
  MVM: { id: 'MVM', name: 'Maternal vascular malperfusion lesions', color: 'bg-red-500', bgColor: 'bg-red-100 dark:bg-red-900/30' },
  FVM: { id: 'FVM', name: 'Fetal Vascular Malperfusion', color: 'bg-green-500', bgColor: 'bg-green-100 dark:bg-green-900/30' },
  AC: { id: 'AC', name: 'Acute Chorioamnionitis', color: 'bg-blue-500', bgColor: 'bg-blue-100 dark:bg-blue-900/30' },
  AA: { id: 'AA', name: 'Acute Abruption', color: 'bg-yellow-500', bgColor: 'bg-yellow-100 dark:bg-yellow-900/30' },
  CI: { id: 'CI', name: 'Chronic Inflammatory Lesions', color: 'bg-orange-500', bgColor: 'bg-orange-100 dark:bg-orange-900/30' },
  DVM: { id: 'DVM', name: 'Delayed Villous Maturation', color: 'bg-purple-500', bgColor: 'bg-purple-100 dark:bg-purple-900/30' },
  VCL: { id: 'VCL', name: 'Villous Capillary Lesions', color: 'bg-pink-500', bgColor: 'bg-pink-100 dark:bg-pink-900/30' },
  OTHER: { id: 'OTHER', name: 'Other Findings', color: 'bg-gray-500', bgColor: 'bg-gray-200 dark:bg-gray-700/30' },
} as const;

export type InjuryPatternId = keyof typeof injuryPatterns;

type Alteration = {
  id: string;
  name: string;
  description: string;
  patternId: InjuryPatternId | null;
  reportingText?: string;
  isFvmMicroscopic?: boolean;
};

type Compartment = {
  id: keyof typeof_compartmentIds;
  name: string;
  icon: LucideIcon | React.FC;
  alterations: Alteration[];
};

export const compartmentIds = {
    umbilicalCord: 'umbilicalCord',
    membranes: 'membranes',
    placentalVilli: 'placentalVilli',
    maternalDecidua: 'maternalDecidua',
} as const;

type typeof_compartmentIds = typeof compartmentIds;

export const compartments: Compartment[] = [
  {
    id: 'umbilicalCord',
    name: 'Umbilical Cord',
    icon: CordIcon,
    alterations: [
      { id: 'normal', name: 'Normal', description: 'No significant abnormalities identified.', patternId: null },
      { id: 'umbilical-phlebitis', name: 'Umbilical Phlebitis', description: 'Neutrophilic inflammation within the wall of the umbilical vein (Stage 1 Fetal Inflammatory Response).', patternId: 'AC' },
      { id: 'umbilical-arteritis', name: 'Umbilical Arteritis', description: 'Neutrophilic inflammation within the walls of one or both umbilical arteries (Stage 2 Fetal Inflammatory Response).', patternId: 'AC' },
      { id: 'necrotizing-funisitis', name: "Necrotizing Funisitis", description: "Concentric rings of neutrophils with necrotic debris around one or more umbilical vessels (Stage 3 Fetal Inflammatory Response).", patternId: 'AC' },
      { id: 'meconium-umbilical-vasculitis', name: 'Meconium-associated umbilical vasculitis', description: 'Inflammation of umbilical vessels in response to meconium.', patternId: 'OTHER', reportingText: 'Mild umbilical vasculitis' },
      { id: 'meconium-associated-vascular-necrosis', name: 'Meconium-associated vascular necrosis', description: 'Myonecrosis of umbilical vessels associated with meconium exposure.', patternId: 'OTHER' },
    ],
  },
  {
    id: 'membranes',
    name: 'Membranes',
    icon: Layers,
    alterations: [
      { id: 'normal', name: 'Normal', description: 'No significant abnormalities identified.', patternId: null },
      { id: 'acute-subchorionitis', name: 'Acute subchorionitis', description: 'Early stage of maternal inflammatory response with neutrophils at the subchorionic plate.', patternId: 'AC' },
      { id: 'acute-chorionitis', name: 'Acute chorionitis', description: 'Maternal inflammatory response with neutrophils involving the chorion.', patternId: 'AC' },
      { id: 'acute-chorioamnionitis', name: 'Acute Chorioamnionitis', description: "Acute neutrophilic inflammation involving the chorion and amnion (Maternal Inflammatory Response). Select this to specify MIR and FIR stages.", patternId: 'AC' },
      { id: 'chorionic-vasculitis', name: 'Chorionic Vasculitis', description: 'Neutrophilic inflammation within the vessels of the chorionic plate (Stage 1 Fetal Inflammatory Response).', patternId: 'AC'},
      { id: 'chronic-chorioamnionitis', name: 'Chronic chorioamnionitis', description: 'Chronic (lymphoplasmacytic) inflammation of the chorion and amnion.', patternId: 'CI' },
      { id: 'chorionic-histiocytic-hyperplasia', name: 'Chorionic histiocytic hyperplasia', description: 'An increase in the number of histiocytes in the chorionic plate, a chronic inflammatory finding.', patternId: 'CI' },
      { id: 'chorion-laeve-pseudocysts', name: 'Chorion laeve pseudocysts', description: 'Optional finding. Cystic structures within the chorion laeve.', patternId: 'MVM' },
      { id: 'chorioamniotic-hemosiderosis', name: 'Chorioamniotic hemosiderosis', description: 'Hemosiderin-laden macrophages in the amnion and chorion, indicative of remote hemorrhage.', patternId: 'OTHER' },
      { id: 'pigment-laden-macrophages', name: 'Pigment-laden macrophages', description: 'Presence of pigment-laden macrophages. Select location below (membranes, chorionic plate, chorionic vessel walls).', patternId: 'OTHER' },
      { id: 'meconium-chorionic-vasculitis', name: 'Meconium-associated chorionic vasculitis', description: 'Inflammation of chorionic vessels in response to meconium.', patternId: 'OTHER', reportingText: 'Mild chorionic vasculitis' },
      { id: 'membranous-laminar-decidual-necrosis', name: 'Membranous laminar decidual necrosis', description: 'Optional finding. Necrosis of the decidua in a laminar pattern.', patternId: 'MVM'},
      { id: 'amnion-nodosum', name: 'Amnion nodosum', description: 'Nodules on the fetal surface of the amnion, associated with oligohydramnios.', patternId: 'OTHER' },
    ],
  },
  {
    id: 'placentalVilli',
    name: 'Placental Villi',
    icon: Leaf,
    alterations: [
      { id: 'normal', name: 'Normal', description: 'No significant abnormalities identified.', patternId: null },
      { id: 'retroplacental-hematoma', name: 'Retroplacental hematoma', description: 'A blood clot located between the placenta and the uterine wall. Select to see more options.', patternId: 'AA' },
      { id: 'remote-marginal-hematoma', name: 'Remote marginal retroplacental hematoma', description: 'Organized and adhered blood clot at the placental margin, indicating a past event.', patternId: 'OTHER' },
      { id: 'intravillous-hemorrhage', name: 'Intravillous hemorrhage', description: 'Bleeding within the villous parenchyma.', patternId: 'AA' },
      { id: 'villous-infarct', name: 'Villous infarct', description: 'An area of villous necrosis due to obstruction of maternal blood supply. Specify size and extent below.', patternId: 'MVM', reportingText: 'Villous infarct' },
      { id: 'infarction-hematoma', name: 'Infarction hematoma', description: 'A central hemorrhage encased by placental infarction.', patternId: 'MVM', reportingText: "Villous infarction hematoma" },
      { id: 'villous-agglutination', name: 'Villous agglutination', description: 'Adherence of villi to one another, often seen in maternal vascular malperfusion.', patternId: 'MVM' },
      { id: 'accelerated-villous-maturation', name: 'Accelerated villous maturation', description: 'Presence of small, hypermature villi for gestational age, with increased syncytial knots (>33% of villi) and intervillous fibrin. A feature of MVM.', patternId: 'MVM' },
      { id: 'distal-villous-hypoplasia', name: 'Distal villous hypoplasia', description: 'Paucity of distal villi relative to stem villi, appearing thin and elongated with increased syncytial knots. A feature of MVM diagnosed when involving at least 30% of one full-thickness slide, typically in placentas <32 weeks.', patternId: 'MVM' },
      { id: 'perivillous-fibrin-plaque', name: 'Perivillous fibrin plaque', description: 'Focally increased perivillous fibrin deposition.', patternId: 'OTHER', reportingText: 'Perivillous fibrin plaque/focally increased perivillous fibrin' },
      { id: 'borderline-perivillous-fibrin', name: 'Borderline increased perivillous fibrin', description: '25-50% of parenchyma involved by perivillous fibrin deposition.', patternId: 'OTHER', reportingText: 'Borderline increased perivillous fibrin' },
      { id: 'massive-perivillous-fibrin', name: 'Massive perivillous fibrin deposition', description: '>50% of parenchyma involved by perivillous fibrin. Associated with adverse outcomes and high recurrence risk.', patternId: 'OTHER', reportingText: 'Massive perivillous fibrin deposition' },
      { id: 'maternal-floor-infarct', name: 'Maternal floor infarct', description: 'Band of fibrinoid material at the basal plate >3 mm thick. Associated with adverse outcomes and high recurrence risk.', patternId: 'OTHER' },
      { id: 'fetal-vessel-thrombosis', name: 'Fetal vessel thrombosis', description: 'Recent or remote blood clots in the chorionic plate or stem vessels.', patternId: 'FVM', isFvmMicroscopic: true },
      { id: 'avascular-villi', name: 'Avascular villi', description: 'Terminal villi showing hyaline fibrosis and total loss of internal capillaries.', patternId: 'FVM', isFvmMicroscopic: true },
      { id: 'stem-vessel-obliteration', name: 'Stem vessel obliteration', description: 'Marked thickening of the stem vessel wall with resultant obliteration of the vascular lumen, a feature of FVM.', patternId: 'FVM', isFvmMicroscopic: true },
      { id: 'villous-stromal-vascular-karyorrhexis', name: 'Villous stromal-vascular karyorrhexis', description: 'Fragmentation (karyorrhexis) of fetal cell nuclei within terminal villi with preservation of surrounding trophoblast.', patternId: 'FVM', isFvmMicroscopic: true },
      { id: 'intramural-fibrin-deposition', name: 'Intramural fibrin deposition', description: 'Subendothelial or intramuscular fibrin/fibrinoid deposits within the walls of large fetal vessels.', patternId: 'FVM', isFvmMicroscopic: true },
      { id: 'low-grade-chronic-villitis', name: 'Low grade chronic villitis', description: 'Villitis of Unknown Etiology (VUE). A lymphohistiocytic inflammation of villi involving <10 contiguous villi per focus.', patternId: 'CI', reportingText: 'Low grade chronic villitis' },
      { id: 'high-grade-chronic-villitis', name: 'High grade chronic villitis', description: 'Villitis of Unknown Etiology (VUE). A lymphohistiocytic inflammation of villi with at least one focus involving >10 contiguous villi.', patternId: 'CI', reportingText: 'High grade chronic villitis' },
      { id: 'basal-chronic-villitis', name: 'Basal chronic villitis', description: 'Chronic inflammation confined to the basal villi adjacent to the maternal floor.', patternId: 'CI' },
      { id: 'eosinophilic-t-cell-vasculitis', name: 'Eosinophilic/T-cell vasculitis', description: 'A mixture of T-lymphocytes and eosinophils within the chorionic plate vessels.', patternId: 'CI', reportingText: 'Eosinophilic/T-cell chorionic vasculitis' },
      { id: 'delayed-villous-maturation', name: 'Delayed villous maturation', description: 'Seen >36 weeks, villous maturation is immature for gestational age. Characterized by monotonous villi, reduced vasculosyncytial membranes, continuous cytotrophoblast layer, and centrally placed capillaries.', patternId: 'DVM' },
      { id: 'villous-dysmaturity', name: 'Villous dysmaturity', description: 'A mixture of delayed and accelerated villous maturation, associated with maternal diabetes and elevated BMI.', patternId: 'DVM' },
      { id: 'chorangiosis', name: 'Chorangiosis', description: 'An increase in the number of blood vessels in the terminal villi, indicating a chronic hypoxic state. Diagnosed with >10 capillaries per villus in >10 villi in several regions.', patternId: 'VCL' },
      { id: 'chorangiomatosis', name: 'Chorangiomatosis', description: 'Multiple foci of stem/immature intermediate villi with an anastomosing network of small vessels.', patternId: 'VCL' },
      { id: 'chorangioma', name: 'Chorangioma', description: 'Benign nodular vascular lesion; report maximum dimension.', patternId: 'VCL' },
      { id: 'patchy-villous-edema', name: 'Patchy villous edema', description: 'Swelling of the placental villi due to fluid accumulation in a patchy distribution.', patternId: 'OTHER' },
      { id: 'diffuse-villous-edema', name: 'Diffuse villous edema', description: 'Diffuse swelling of placental villi, consistent with hydrops placentalis.', patternId: 'OTHER' },
      { id: 'increased-fetal-nrbcs', name: 'Increased fetal NRBCs', description: 'Increased number of nucleated red blood cells in fetal circulation (defined as at least one NRBC per 40x field in fetal capillaries).', patternId: 'OTHER', reportingText: 'Increased fetal nucleated red blood cells' },
      { id: 'intervillous-thrombus', name: 'Intervillous thrombus', description: 'A laminated blood clot within the intervillous space.', patternId: 'OTHER' },
      { id: 'sickled-red-blood-cells', name: 'Sickled maternal red blood cells', description: 'Presence of sickled maternal red blood cells in the intervillous space.', patternId: 'OTHER' },
      { id: 'chronic-histiocytic-intervillositis', name: 'Chronic histiocytic intervillositis', description: 'Infiltration of the intervillous space by mononuclear cells (histiocytes), without a significant component of chronic villitis.', patternId: 'CI', reportingText: 'Chronic histiocytic intervillositis, see comment' },
    ],
  },
  {
    id: 'maternalDecidua',
    name: 'Maternal Decidua',
    icon: User,
    alterations: [
      { id: 'normal', name: 'Normal', description: 'No significant abnormalities identified.', patternId: null },
      { id: 'decidual-arteriopathy-atherosis', name: 'Decidual arteriopathy (acute atherosis)', description: 'A form of decidual arteriopathy characterized by fibrinoid necrosis of the vessel wall, often with an accumulation of lipid-laden macrophages (foam cells). A key feature of MVM.', patternId: 'MVM', reportingText: 'Decidual arteriopathy (acute atherosis)' },
      { id: 'decidual-arteriopathy-mural-hypertrophy', name: 'Decidual arteriopathy (mural hypertrophy)', description: 'Abnormalities in maternal spiral arteries, including mural hypertrophy. A key feature of MVM.', patternId: 'MVM', reportingText: 'Decidual arteriopathy (mural hypertrophy of maternal vessels)' },
      { id: 'decidual-arteriopathy-no-remodeling', name: 'Decidual arteriopathy (no remodeling)', description: 'Failure of physiologic conversion of spiral arteries. A feature of MVM.', patternId: 'MVM', reportingText: 'Decidual arteriopathy (absence of spiral artery remodeling)' },
      { id: 'lymphoplasmacytic-deciduitis', name: 'Lymphoplasmacytic/plasma cell deciduitis', description: 'A heavy infiltration of lymphocytes and plasma cells in the basal plate (maternal decidua). A form of chronic inflammation.', patternId: 'CI' },
      { id: 'basal-plate-myometrial-fibers', name: 'Basal plate myometrial fibers', description: 'Presence of myometrial fibers at the placental basal plate, relevant for placenta accreta spectrum (PAS). Staged per the 2020 Placenta Accreta Spectrum (PAS) Task Force criteria (Hecht et al., Mod Pathol 2020): Stage 1 = BPMF with intervening decidua (may be an incidental finding); Stage 2 = BPMF without intervening decidua (may support non-invasive PAS).', patternId: 'OTHER' },
    ],
  },
];

export const specificInfections = {
    id: 'specificInfections',
    name: 'Specific Infections',
    icon: Bug,
    alterations: [
        { id: 'candida', name: 'Candida', description: 'Fungal infection, often causing funisitis.' },
        { id: 'cmv', name: 'CMV', description: 'Cytomegalovirus infection, may show plasma cell villitis and characteristic inclusions.' },
        { id: 'hsv', name: 'HSV', description: 'Herpes Simplex Virus infection.' },
        { id: 'parvovirus', name: 'Parvovirus', description: 'Parvovirus B19 infection, can cause hydrops fetalis.' },
    ]
};
