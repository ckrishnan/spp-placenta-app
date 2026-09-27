import { z } from 'zod';
import { compartments, specificInfections as specificInfectionsData } from './constants';

const createAlterationSchema = (alterations: { id: string; name: string }[]) => {
  const shape: Record<string, z.ZodTypeAny> = {};
  alterations.forEach((alteration) => {
    shape[alteration.id] = z.boolean().default(false);
  });
  return z.object(shape);
};

const createSpecificInfectionsSchema = (alterations: { id: string; name: string }[]) => {
  const shape: Record<string, z.ZodTypeAny> = {};
  alterations.forEach((alteration) => {
    shape[alteration.id] = z.boolean().default(false);
  });
  shape['other'] = z.string().optional();
  return z.object(shape);
};

const findingsSchema = z.object({
  placentalWeight: z.coerce.number().optional(),
  completenessOfMaternalSurface: z.enum(['complete', 'incomplete', 'disrupted']).optional(),
  
  // Gross Findings
  grossFindings: z.object({
    marginalCordInsertion: z.boolean().default(false),
    velamentousCordInsertion: z.boolean().default(false),
    circumvallateMembraneInsertion: z.boolean().default(false),
    accessoryLobe: z.boolean().default(false),
    twoVesselCord: z.boolean().default(false),
    hypocoiledCord: z.boolean().default(false),
    longCord: z.boolean().default(false),
    hypercoiledCord: z.boolean().default(false),
    trueKnot: z.boolean().default(false),
    cordStricture: z.boolean().default(false),
    thinCord: z.boolean().default(false),
    tetheredCord: z.boolean().default(false),
    greenStaining: z.boolean().default(false),
  }),

  // Pathologic Findings
  umbilicalCord: createAlterationSchema(compartments.find(c => c.id === 'umbilicalCord')!.alterations),
  membranes: createAlterationSchema(compartments.find(c => c.id === 'membranes')!.alterations),
  placentalVilli: createAlterationSchema(compartments.find(c => c.id === 'placentalVilli')!.alterations),
  maternalDecidua: createAlterationSchema(compartments.find(c => c.id === 'maternalDecidua')!.alterations),
  
  specificInfections: createSpecificInfectionsSchema(specificInfectionsData.alterations),

  // Chorioamnionitis staging
  mirStage: z.string().optional(),
  mirGrade: z.string().optional(),
  firStage: z.string().optional(),
  firGrade: z.string().optional(),
  
  // Optional chorio details
  bacteriaPresent: z.string().optional(),
  gramStainResults: z.string().optional(),
  gmsResults: z.string().optional(),
  
  // Infarct details
  infarctSize: z.string().optional(),
  infarctExtent: z.string().optional(),
  
  // Abruption details
  hematomaParenchymalCompression: z.boolean().default(false),
  hematomaOverlyingInfarction: z.boolean().default(false),

  // FVM Details
  thrombusType: z.enum(['occlusive', 'non-occlusive']).optional(),
  thrombusLocation: z.enum(['chorionic-plate', 'stem-vessel']).optional(),
  intramuralFibrinLocation: z.enum(['chorionic-plate', 'stem-vessel']).optional(),
  avascularVilliSize: z.enum(['small', 'intermediate', 'large']).optional(),
  vsvkSize: z.enum(['small', 'intermediate', 'large']).optional(),

  // BPMF Details
  bpmfFocality: z.string().optional(),
  bpmfLength: z.string().optional(),
  bpmfStage: z.string().optional(),

  // DVM Details
  dvmFocality: z.enum(['focal', 'diffuse']).optional(),

  // Chronic villitis extent (focal/multifocal for low grade; patchy/diffuse for high grade)
  chronicVillitisExtent: z.enum(['focal', 'multifocal', 'patchy', 'diffuse']).optional(),

  // Villitis-associated secondary changes (reported with the villitis rather than as primary FVM)
  villitisStemVesselObliteration: z.boolean().default(false),
  villitisAvascularVilli: z.boolean().default(false),
  villitisPerivillousFibrin: z.boolean().default(false),

  // Pigment-laden macrophages location
  pigmentMacrophagesMembranes: z.boolean().default(false),
  pigmentMacrophagesChorionicPlate: z.boolean().default(false),
  pigmentMacrophagesChorionicVesselWalls: z.boolean().default(false),

  additionalMicroscopicFindings: z.string().optional(),
});

export const formSchema = z.object({
  gestationalAgeWeeks: z.coerce.number().min(18, "Must be at least 18").max(46, "Must be at most 46"),
  gestationalAgeDays: z.coerce.number().min(0).max(6).optional(),
  isTwin: z.boolean().default(false),
  chorionicity: z.enum(['monochorionic', 'dichorionic']).optional(),
  amnionicity: z.enum(['monoamniotic', 'diamniotic']).optional(),
  modeOfDelivery: z.enum(['vaginal', 'cesarean']).optional(),

  // Combined weight of all twin placentas, in grams. The twin reference tables are
  // combined-weight tables, so this is the only weight used for twin percentiles.
  // Individual per-twin weights are still reported when provided.
  combinedTwinWeight: z.coerce.number().optional(),

  // Monochorionic twin vascular territory / anastomoses (recommended elements,
  // reported once for the shared placenta rather than per twin).
  vascularShareTwinA: z.string().optional(),
  vascularShareTwinB: z.string().optional(),
  vascularAnastomosesPresent: z.boolean().default(false),
  vascularAnastomosesCount: z.string().optional(),
  vascularAnastomosesType: z.string().optional(),
  
  // Clinical Context
  clinicalAbruption: z.boolean().default(false),
  clinicalPAS: z.boolean().default(false),
  clinicalIUFD: z.boolean().default(false),
  clinicalIAI: z.boolean().default(false),
  clinicalMSF: z.boolean().default(false),

  findings: z.array(findingsSchema).min(1).max(2),
  reportFormat: z.string().default('option1_A'),
}).superRefine((data, ctx) => {
  // Per-twin weights are optional in twin mode (placentas are not always weighed
  // separately), so only a singleton requires a weight on the first finding.
  if (!data.isTwin) {
    const weight1 = data.findings[0]?.placentalWeight;
    if (weight1 === undefined || isNaN(weight1) || weight1 < 50 || weight1 > 1500) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Placental weight must be between 50g and 1500g",
        path: ["findings", 0, "placentalWeight"],
      });
    }
  }

  if (data.isTwin) {
    // Any per-twin weight that is entered must still be in range.
    const weight1 = data.findings[0]?.placentalWeight;
    if (weight1 !== undefined && !isNaN(weight1) && (weight1 < 50 || weight1 > 1500)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Placental weight must be between 50g and 1500g",
        path: ["findings", 0, "placentalWeight"],
      });
    }
    const weight2 = data.findings[1]?.placentalWeight;
    if (weight2 !== undefined && !isNaN(weight2) && (weight2 < 50 || weight2 > 1500)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Placental weight must be between 50g and 1500g",
        path: ["findings", 1, "placentalWeight"],
      });
    }

    // Twin percentiles use the combined weight, so it is required for twin cases.
    const combined = data.combinedTwinWeight;
    if (combined === undefined || isNaN(combined) || combined < 50 || combined > 3000) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Combined twin weight is required (50g to 3000g)",
        path: ["combinedTwinWeight"],
      });
    }
  }
});

export type Findings = z.infer<typeof findingsSchema>;
export type FormValues = z.infer<typeof formSchema>;
