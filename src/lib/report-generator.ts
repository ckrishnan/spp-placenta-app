import { FormValues, Findings } from './schema';
import { compartments, injuryPatterns } from './constants';
import { calculatePercentileRank, getWeightReferenceCitation, type WeightReference } from './calculations';

// Secondary changes associated with chronic villitis that should be reported with the
// villitis (CI group) rather than being classified as primary fetal vascular malperfusion.
function getVillitisAssociatedSuffix(finding: Findings): string {
  const assoc: string[] = [];
  if (finding.villitisStemVesselObliteration) assoc.push('stem vessel obliteration');
  if (finding.villitisAvascularVilli) assoc.push('avascular villi');
  if (finding.villitisPerivillousFibrin) assoc.push('perivillous fibrin deposition');
  if (assoc.length === 0) return '';
  let joined = assoc[0];
  if (assoc.length === 2) joined = `${assoc[0]} and ${assoc[1]}`;
  if (assoc.length > 2) joined = `${assoc.slice(0, -1).join(', ')}, and ${assoc[assoc.length - 1]}`;
  return `, associated with ${joined}`;
}

function generateMicroscopicForFinding(finding: Findings, isTwin: boolean, index: number): string {
  const parts: string[] = [];
  const twinPrefix = isTwin ? `TWIN ${index === 0 ? 'A' : 'B'}:\n` : '';

  // 1. Umbilical Cord
  const cordAlterations = Object.entries(finding.umbilicalCord || {})
    .filter(([id, selected]) => selected && id !== 'normal')
    .map(([id]) => id);

  if (cordAlterations.length === 0) {
    parts.push(`Sections of the umbilical cord confirm three vessels without neutrophilic infiltration or intravascular thrombus formation.`);
  } else {
    const cordParts: string[] = [];
    cordParts.push(`Sections of the umbilical cord appear unremarkable.`);
    
    if (finding.umbilicalCord['umbilical-phlebitis']) {
        let text = "There is a neutrophilic infiltrate within the wall of the umbilical vein (Stage 1 Fetal Inflammatory Response)";
        if (finding.firGrade === '2') text += ", severe grade (near-confluent neutrophils)";
        text += ".";
        cordParts.push(text);
    }
    if (finding.umbilicalCord['umbilical-arteritis']) {
        let text = "There is a neutrophilic infiltrate within the walls of the umbilical arteries (Stage 2 Fetal Inflammatory Response)";
        if (finding.firGrade === '2') text += ", severe grade (near-confluent neutrophils)";
        text += ".";
        cordParts.push(text);
    }
    if (finding.umbilicalCord['necrotizing-funisitis']) {
        cordParts.push("There is necrotizing funisitis characterized by concentric rings of neutrophils and necrotic debris around the umbilical vessels (Stage 3 Fetal Inflammatory Response).");
    }
    if (finding.umbilicalCord['meconium-umbilical-vasculitis']) cordParts.push("There is a mild neutrophilic infiltrate in the walls of the umbilical vessels, consistent with meconium-associated vasculitis.");
    if (finding.umbilicalCord['meconium-associated-vascular-necrosis']) cordParts.push("There is myonecrosis of the umbilical vessel walls, consistent with meconium-associated vascular necrosis.");
    
    parts.push(cordParts.join(' '));
  }

  // 2. Membranes
  const memAlterations = Object.entries(finding.membranes || {})
    .filter(([id, selected]) => selected && id !== 'normal')
    .map(([id]) => id);

  if (memAlterations.length === 0) {
    parts.push("The placental membranes consist of amnion and attached chorion without neutrophilic infiltration.");
  } else {
    const memParts: string[] = [];
    memParts.push("The placental membranes consist of amnion and attached chorion.");
    if (finding.membranes['acute-subchorionitis']) {
        let text = "There is a neutrophilic infiltrate at the subchorionic plate, consistent with acute subchorionitis (Stage 1 Maternal Inflammatory Response)";
        if (finding.mirGrade === '2') text += ", severe grade (confluent neutrophils)";
        text += ".";
        memParts.push(text);
    }
    if (finding.membranes['acute-chorionitis']) {
        let text = "There is a neutrophilic infiltrate involving the chorion, consistent with acute chorionitis (Stage 1 Maternal Inflammatory Response)";
        if (finding.mirGrade === '2') text += ", severe grade (confluent neutrophils)";
        text += ".";
        memParts.push(text);
    }
    if (finding.membranes['acute-chorioamnionitis']) {
        let text = "There is a neutrophilic infiltrate involving the chorion and amnion";
        if (finding.mirStage === '3') text += " with associated amniocyte necrosis (Stage 3 Maternal Inflammatory Response)";
        else text += " (Stage 2 Maternal Inflammatory Response)";
        
        if (finding.mirGrade === '2') text += ", severe grade (confluent neutrophils)";
        text += ".";
        memParts.push(text);
    }
    if (finding.membranes['chorionic-vasculitis']) {
        let text = "There is a neutrophilic infiltrate within the walls of the chorionic plate vessels (Stage 1 Fetal Inflammatory Response)";
        if (finding.firGrade === '2') text += ", severe grade (near-confluent neutrophils)";
        text += ".";
        memParts.push(text);
    }
    if (finding.membranes['chronic-chorioamnionitis']) memParts.push("There is a lymphoplasmacytic infiltrate involving the chorion and amnion.");
    if (finding.membranes['chorionic-histiocytic-hyperplasia']) memParts.push("There is an increase in the number of histiocytes in the chorionic plate.");
    if (finding.membranes['chorioamniotic-hemosiderosis']) memParts.push("There is chorioamniotic hemosiderosis with hemosiderin-laden macrophages in the amnion and chorion.");
    if (finding.membranes['pigment-laden-macrophages']) {
        const locations: string[] = [];
        if (finding.pigmentMacrophagesMembranes) locations.push('membranes');
        if (finding.pigmentMacrophagesChorionicPlate) locations.push('chorionic plate');
        if (finding.pigmentMacrophagesChorionicVesselWalls) locations.push('chorionic vessel walls');
        if (locations.length > 0) {
            memParts.push(`Pigment-laden macrophages are present in the ${locations.join(' and ')}.`);
        } else {
            memParts.push("Pigment-laden macrophages are present in the membranes and chorionic plate.");
        }
    }
    if (finding.membranes['meconium-chorionic-vasculitis']) memParts.push("There is a mild neutrophilic infiltrate in the walls of the chorionic vessels, consistent with meconium-associated vasculitis.");
    if (finding.membranes['membranous-laminar-decidual-necrosis']) memParts.push("There is laminar necrosis of the decidua capsularis/laeve.");
    if (finding.membranes['amnion-nodosum']) memParts.push("Nodules of vernix caseosa and squames are present on the fetal surface of the amnion.");
    
    parts.push(memParts.join(' '));
  }

  // 3. Placental Villi / Parenchyma
  const villiAlterations = Object.entries(finding.placentalVilli || {})
    .filter(([id, selected]) => selected && id !== 'normal')
    .map(([id]) => id);

  const diskParts: string[] = [];
  diskParts.push("The placental disk shows an intact chorionic plate.");
  
  if (villiAlterations.length === 0) {
    diskParts.push("The parenchyma has villous development that is consistent with the infant’s estimated gestational age. There is no pathologic increase in perivillous fibrin deposition, calcifications or fetal nucleated red blood cells. No villitis, thrombosis, or infarcts are seen.");
  } else {
    if (finding.placentalVilli['intravillous-hemorrhage']) diskParts.push("There is focal intravillous hemorrhage.");
    if (finding.placentalVilli['villous-infarct']) {
        let text = "There is a villous infarct";
        if (finding.infarctSize || finding.infarctExtent) {
            text += " (";
            if (finding.infarctSize) text += `size: ${finding.infarctSize}`;
            if (finding.infarctSize && finding.infarctExtent) text += ", ";
            if (finding.infarctExtent) text += `extent: ${finding.infarctExtent}`;
            text += ")";
        }
        text += ".";
        diskParts.push(text);
    }
    if (finding.placentalVilli['infarction-hematoma']) diskParts.push("There is a villous infarction hematoma.");
    if (finding.placentalVilli['villous-agglutination']) diskParts.push("There is villous agglutination.");
    if (finding.placentalVilli['accelerated-villous-maturation']) diskParts.push("The villi show features of accelerated maturation, including increased syncytial knots and intervillous fibrin deposition, consistent with maternal vascular malperfusion.");
    if (finding.placentalVilli['distal-villous-hypoplasia']) diskParts.push("There is distal villous hypoplasia characterized by thin, elongated villi and a paucity of terminal villi, often associated with maternal vascular malperfusion.");
    if (finding.placentalVilli['perivillous-fibrin-plaque']) diskParts.push("There is a localized perivillous fibrin plaque.");
    if (finding.placentalVilli['borderline-perivillous-fibrin']) diskParts.push("There is borderline increased perivillous fibrin deposition involving approximately 25-50% of the parenchyma.");
    if (finding.placentalVilli['massive-perivillous-fibrin']) diskParts.push("There is massive perivillous fibrin deposition involving more than 50% of the parenchyma, consistent with maternal floor infarct/massive perivillous fibrin deposition (MFI/MPFD).");
    if (finding.placentalVilli['maternal-floor-infarct']) diskParts.push("There is a thick band of fibrin at the maternal floor exceeding 3mm in thickness.");
    if (finding.placentalVilli['fetal-vessel-thrombosis']) diskParts.push("There is a thrombus within a large fetal vessel (chorionic plate or stem vessel), consistent with fetal vascular malperfusion.");
    if (finding.placentalVilli['avascular-villi']) diskParts.push("There are foci of avascular villi characterized by hyalinized stroma and loss of fetal capillaries, consistent with fetal vascular malperfusion.");
    if (finding.placentalVilli['stem-vessel-obliteration']) diskParts.push("There is obliteration of stem vessel lumens by fibromuscular sclerosis.");
    if (finding.placentalVilli['villous-stromal-vascular-karyorrhexis']) diskParts.push("There is villous stromal-vascular karyorrhexis characterized by fragmentation of fetal red blood cells and nuclear debris within villous capillaries.");
    if (finding.placentalVilli['intramural-fibrin-deposition']) {
        const locationText = finding.intramuralFibrinLocation === 'chorionic-plate' ? 'chorionic plate vessels' : finding.intramuralFibrinLocation === 'stem-vessel' ? 'stem vessels' : 'large fetal vessels';
        diskParts.push(`There is intramural fibrin deposition within the walls of ${locationText}.`);
    }
    if (finding.placentalVilli['low-grade-chronic-villitis']) {
        let text = "There is low-grade chronic villitis of unknown etiology (VUE) characterized by a lymphohistiocytic infiltrate involving less than 10 villi per focus";
        if (finding.chronicVillitisExtent) text += `, ${finding.chronicVillitisExtent}`;
        text += getVillitisAssociatedSuffix(finding);
        text += ".";
        diskParts.push(text);
    }
    if (finding.placentalVilli['high-grade-chronic-villitis']) {
        let text = "There is high-grade chronic villitis of unknown etiology (VUE) characterized by a lymphohistiocytic infiltrate involving more than 10 villi per focus or multiple foci";
        if (finding.chronicVillitisExtent) text += `, ${finding.chronicVillitisExtent}`;
        text += getVillitisAssociatedSuffix(finding);
        text += ".";
        diskParts.push(text);
    }
    if (finding.placentalVilli['chronic-histiocytic-intervillositis']) diskParts.push("There is chronic histiocytic intervillositis.");
    if (finding.placentalVilli['basal-chronic-villitis']) diskParts.push("There is chronic villitis involving the basal villi.");
    if (finding.placentalVilli['eosinophilic-t-cell-vasculitis']) diskParts.push("There is eosinophilic/T-cell vasculitis involving the chorionic plate vessels.");
    if (finding.placentalVilli['delayed-villous-maturation']) diskParts.push("The villi show delayed maturation for gestational age, characterized by large, edematous villi with centrally located vessels and a paucity of syncytial knots.");
    if (finding.placentalVilli['villous-dysmaturity']) diskParts.push("There is villous dysmaturity with a mixture of maturation patterns, including both accelerated and delayed features, often seen in the context of maternal metabolic disease.");
    if (finding.placentalVilli['chorangiosis']) diskParts.push("There is chorangiosis characterized by more than 10 capillaries in more than 10 villi in several areas of the placenta.");
    if (finding.placentalVilli['chorangiomatosis']) diskParts.push("There is chorangiomatosis characterized by a proliferation of small vessels within the stem villi.");
    if (finding.placentalVilli['chorangioma']) diskParts.push("There is a chorangioma.");
    if (finding.placentalVilli['patchy-villous-edema']) diskParts.push("There is patchy villous edema.");
    if (finding.placentalVilli['diffuse-villous-edema']) diskParts.push("There is diffuse villous edema.");
    if (finding.placentalVilli['increased-fetal-nrbcs']) diskParts.push("There are increased fetal nucleated red blood cells.");
    if (finding.placentalVilli['intervillous-thrombus']) diskParts.push("There is an intervillous thrombus.");
    if (finding.placentalVilli['sickled-red-blood-cells']) diskParts.push("Sickled maternal red blood cells are present in the intervillous space.");
  }
  parts.push(diskParts.join(' '));

  // 4. Maternal Decidua
  const deciduaAlterations = Object.entries(finding.maternalDecidua || {})
    .filter(([id, selected]) => selected && id !== 'normal')
    .map(([id]) => id);

  if (deciduaAlterations.length === 0) {
    parts.push("The decidua show the expected transformation changes. No features of decidual arteriopathy or chronic deciduitis are identified.");
  } else {
    const deciduaParts: string[] = [];
    if (finding.maternalDecidua['decidual-arteriopathy-atherosis']) deciduaParts.push("There is decidual arteriopathy with acute atherosis.");
    if (finding.maternalDecidua['decidual-arteriopathy-mural-hypertrophy']) deciduaParts.push("There is decidual arteriopathy with mural hypertrophy.");
    if (finding.maternalDecidua['decidual-arteriopathy-no-remodeling']) deciduaParts.push("There is decidual arteriopathy with failure of physiologic remodeling.");
    if (finding.maternalDecidua['lymphoplasmacytic-deciduitis']) deciduaParts.push("There is lymphoplasmacytic deciduitis with plasma cells.");
    if (finding.maternalDecidua['basal-plate-myometrial-fibers']) deciduaParts.push("Myometrial fibers are present at the basal plate.");
    
    parts.push(deciduaParts.join(' '));
  }

  // 5. Specific Infections
  const infectionAlterations = Object.entries(finding.specificInfections || {})
    .filter(([id, selected]) => selected && id !== 'other')
    .map(([id]) => id);

  if (infectionAlterations.length > 0 || finding.specificInfections?.other) {
    const infectionParts: string[] = [];
    if (finding.specificInfections?.candida) infectionParts.push("Fungal organisms morphologically consistent with Candida are identified.");
    if (finding.specificInfections?.cmv) infectionParts.push("Viral inclusions morphologically consistent with CMV are identified.");
    if (finding.specificInfections?.hsv) infectionParts.push("Viral inclusions morphologically consistent with HSV are identified.");
    if (finding.specificInfections?.parvovirus) infectionParts.push("Viral inclusions morphologically consistent with Parvovirus are identified.");
    if (finding.specificInfections?.other) infectionParts.push(`Additional findings: ${finding.specificInfections.other}.`);
    
    parts.push(infectionParts.join(' '));
  }

  // 6. Additional Findings
  if (finding.additionalMicroscopicFindings) {
    parts.push(`Additional findings: ${finding.additionalMicroscopicFindings}`);
  }

  return twinPrefix + parts.join('\n\n');
}

function generateFinalDiagnosisForFinding(finding: Findings, isTwin: boolean, index: number, ga: number, clinicalMSF: boolean, clinicalAbruption: boolean, weightReference: WeightReference = 'pinar'): string[] {
  const lines: string[] = [];
  const twinPrefix = isTwin ? `TWIN ${index === 0 ? 'A' : 'B'}:` : '';
  
  if (twinPrefix) lines.push(twinPrefix);

  const birthType = isTwin ? 'twin' : 'singleton';
  const percentile = calculatePercentileRank(Number(finding.placentalWeight), ga, birthType, weightReference);
  const percentileText = (percentile && percentile !== 'N/A') ? ` (${percentile} percentile)` : '';
  lines.push(`- Placental weight: ${finding.placentalWeight} g${percentileText}`);

  const findingsList: { patternId: string | null; text: string; id?: string }[] = [];

  // Meconium-related diagnoses are grouped together under their own header in the output.
  const meconiumIds = new Set(['pigment-laden-macrophages', 'meconium-chorionic-vasculitis', 'meconium-umbilical-vasculitis', 'meconium-associated-vascular-necrosis']);

  // Acute chorioamnionitis family: MIR findings (subchorionitis/chorionitis/chorioamnionitis)
  // and FIR findings (chorionic vasculitis, umbilical phlebitis/arteritis, necrotizing funisitis).
  // When an MIR finding is selected they combine into one descriptive block; isolated FIR
  // findings print as standalone diagnoses rather than an assumed "acute chorioamnionitis".
  const chorioMirIds = ['acute-subchorionitis', 'acute-chorionitis', 'acute-chorioamnionitis'];
  const chorioFirIds = ['chorionic-vasculitis', 'umbilical-phlebitis', 'umbilical-arteritis', 'necrotizing-funisitis'];
  const chorioIds = new Set([...chorioMirIds, ...chorioFirIds]);
  const selectedMir = chorioMirIds.filter(id => finding.membranes[id]);
  const selectedFir = chorioFirIds.filter(id => finding.membranes[id] || finding.umbilicalCord[id]);

  // Acute abruption is a clinical diagnosis and needs more than one supporting histologic
  // feature; a single isolated feature (e.g. intravillous hemorrhage alone) prints standalone.
  const aaFeatureIds = ['retroplacental-hematoma', 'intravillous-hemorrhage'];
  const selectedAaFeatures = aaFeatureIds.filter(id => finding.placentalVilli[id]);
  const hasAbruptionGroup = selectedAaFeatures.length >= 2;

  // Compartment alterations
  compartments.forEach(compartment => {
    const compartmentValues = finding[compartment.id as keyof Findings] as Record<string, boolean>;
    if (compartmentValues) {
      Object.entries(compartmentValues).forEach(([id, selected]) => {
        if (selected && id !== 'normal') {
          const alteration = compartment.alterations.find(a => a.id === id);
          if (alteration) {
            let text = alteration.reportingText || alteration.name;
            
            if (meconiumIds.has(id)) {
                if (id === 'pigment-laden-macrophages') {
                    const locations: string[] = [];
                    if (finding.pigmentMacrophagesMembranes) locations.push('membranes');
                    if (finding.pigmentMacrophagesChorionicPlate) locations.push('chorionic plate');
                    if (finding.pigmentMacrophagesChorionicVesselWalls) locations.push('chorionic vessel walls');
                    let meconiumText = 'Pigment-laden macrophages';
                    if (locations.length > 0) {
                        meconiumText += ` in ${locations.join(' and ')}`;
                    } else {
                        meconiumText += ' in membranes/chorionic plate/chorionic vessel walls';
                    }
                    if (clinicalMSF) meconiumText += ', consistent with meconium';
                    findingsList.push({ patternId: 'MECONIUM', text: `- ${meconiumText}`, id });
                    return;
                }
                if (id === 'meconium-chorionic-vasculitis' || id === 'meconium-umbilical-vasculitis') {
                    let meconiumText = alteration.reportingText || alteration.name;
                    if (clinicalMSF) meconiumText += ', consistent with meconium';
                    findingsList.push({ patternId: 'MECONIUM', text: `- ${meconiumText}`, id });
                    return;
                }
                // meconium-associated-vascular-necrosis
                findingsList.push({ patternId: 'MECONIUM', text: `- ${alteration.name}`, id });
                return;
            }
            
            if (chorioIds.has(id)) return; // handled by the combined acute chorio block below

            if (id === 'villous-infarct' && (finding.infarctSize || finding.infarctExtent)) {
                const details: string[] = [];
                if (finding.infarctSize) details.push(finding.infarctSize);
                if (finding.infarctExtent) details.push(finding.infarctExtent);
                text += ` (${details.join(', ')})`;
            }

            if (id === 'fetal-vessel-thrombosis' && (finding.thrombusType || finding.thrombusLocation)) {
                const details: string[] = [];
                if (finding.thrombusType) details.push(finding.thrombusType);
                if (finding.thrombusLocation) {
                    details.push(finding.thrombusLocation === 'chorionic-plate' ? 'chorionic plate' : 'stem vessel');
                }
                text += ` (${details.join(', ')})`;
            }

            if (id === 'avascular-villi' && finding.avascularVilliSize) text += ` (${finding.avascularVilliSize} focus)`;

            if (id === 'villous-stromal-vascular-karyorrhexis' && finding.vsvkSize) text += ` (${finding.vsvkSize} focus)`;

            if (id === 'intramural-fibrin-deposition') {
                const loc = finding.intramuralFibrinLocation;
                let locText = 'large fetal vessels';
                if (loc === 'chorionic-plate') locText = 'chorionic plate vessels';
                else if (loc === 'stem-vessel') locText = 'stem vessels';
                
                text = `Intramural fibrin deposition within ${locText}`;
            }

            if (id === 'basal-plate-myometrial-fibers' && (finding.bpmfFocality || finding.bpmfStage || finding.bpmfLength)) {
                const details: string[] = [];
                if (finding.bpmfFocality) details.push(finding.bpmfFocality);
                if (finding.bpmfLength) details.push(`linear length of longest focus (mm): ${finding.bpmfLength}`);
                if (finding.bpmfStage) details.push(`stage ${finding.bpmfStage}`);
                text = `Basal plate myometrial fibers, ${details.join(', ')}, see comment`;
            }

            if (id === 'delayed-villous-maturation') {
                // Single non-redundant line (manuscript: "Delayed villous maturation, [focal/diffuse]")
                const dvmText = finding.dvmFocality ? `Delayed villous maturation [${finding.dvmFocality}]` : 'Delayed villous maturation';
                findingsList.push({ patternId: null, text: `-- ${dvmText}` });
                return;
            }
            
            if (id === 'villous-dysmaturity') {
                // Independent line for dysmaturity
                findingsList.push({ patternId: 'OTHER', text: `- Villous dysmaturity (delayed villous maturation with increased syncytial knots), see comment` });
                return;
            }

            if (id === 'retroplacental-hematoma' && (finding.hematomaParenchymalCompression || finding.hematomaOverlyingInfarction)) {
                const details: string[] = [];
                if (finding.hematomaParenchymalCompression) details.push("parenchymal compression");
                if (finding.hematomaOverlyingInfarction) details.push("overlying villous infarction");
                text += ` with ${details.join(' and ')}`;
            }

            if (id === 'low-grade-chronic-villitis' || id === 'high-grade-chronic-villitis') {
                // Manuscript style: extent precedes grade, e.g. "Patchy high grade chronic villitis"
                if (finding.chronicVillitisExtent) {
                    const extent = finding.chronicVillitisExtent.charAt(0).toUpperCase() + finding.chronicVillitisExtent.slice(1);
                    text = `${extent} ${text.charAt(0).toLowerCase() + text.slice(1)}`;
                }
                // Report villitis-associated secondary changes with the villitis (CI group),
                // not as primary fetal vascular malperfusion.
                text += getVillitisAssociatedSuffix(finding);
            }
            
            // Abruption header requires >=2 supporting features; a single isolated feature
            // (e.g. intravillous hemorrhage alone) prints as a standalone line.
            const isAaFeature = id === 'retroplacental-hematoma' || id === 'intravillous-hemorrhage';
            const pushPatternId = isAaFeature && !hasAbruptionGroup ? 'OTHER' : alteration.patternId;
            findingsList.push({ patternId: pushPatternId, text: `- ${text}` });
          }
        }
      });
    }
  });

  // Combined acute chorioamnionitis block: fold MIR + FIR findings into one descriptive block
  if (selectedMir.length > 0 || selectedFir.length > 0) {
    if (selectedMir.length > 0) {
      const derivedMirStage = finding.membranes['acute-chorioamnionitis'] ? '2' : '1';
      const mirStage = finding.mirStage || derivedMirStage;
      const mirGrade = finding.mirGrade || '1';

      let diagnosisTitle = '';
      if (mirStage === '3') {
        diagnosisTitle = 'Necrotizing acute chorioamnionitis';
      } else if (mirStage === '2' || finding.membranes['acute-chorioamnionitis']) {
        // Title is driven by the selected finding; the manual MIR stage is reported
        // in the "Maternal inflammatory response" line below.
        diagnosisTitle = mirGrade === '2' ? 'Severe acute chorioamnionitis' : 'Acute chorioamnionitis';
      } else {
        const base = finding.membranes['acute-chorionitis'] ? 'Acute chorionitis' : 'Acute subchorionitis';
        diagnosisTitle = mirGrade === '2' ? `Severe ${base.toLowerCase()}` : base;
      }

      // FIR localization derived from the selected FIR findings (manuscript verbiage)
      const firLocations: string[] = [];
      if (selectedFir.includes('chorionic-vasculitis')) firLocations.push('chorionic plate vessels');
      if (selectedFir.includes('umbilical-phlebitis')) firLocations.push('umbilical vein');
      if (selectedFir.includes('umbilical-arteritis')) firLocations.push('umbilical arteries');
      if (selectedFir.includes('necrotizing-funisitis')) firLocations.push('umbilical vessels (necrotizing funisitis)');
      if (firLocations.length > 0) {
        diagnosisTitle += ` [with fetal inflammatory response in ${firLocations.join('/')}]`;
      }

      const responseLines: string[] = [];
      responseLines.push(`Maternal inflammatory response, stage ${mirStage}${finding.mirGrade ? `, grade ${finding.mirGrade}` : ''}`);
      if (selectedFir.length > 0) {
        const derivedFirStage = selectedFir.includes('necrotizing-funisitis') ? '3' : selectedFir.includes('umbilical-arteritis') ? '2' : '1';
        const firStage = finding.firStage || derivedFirStage;
        responseLines.push(`Fetal inflammatory response, stage ${firStage}${finding.firGrade ? `, grade ${finding.firGrade}` : ''}`);
      }

      findingsList.push({ patternId: null, text: [`-- ${diagnosisTitle}:`, ...responseLines.map(l => `\t- ${l}`)].join('\n') });
    } else {
      // Isolated fetal inflammatory response without a maternal response: standalone diagnoses
      const firLabels: Record<string, string> = {
        'chorionic-vasculitis': 'Acute chorionic vasculitis',
        'umbilical-phlebitis': 'Acute umbilical phlebitis',
        'umbilical-arteritis': 'Acute umbilical arteritis',
        'necrotizing-funisitis': 'Necrotizing funisitis',
      };
      selectedFir.forEach(id => {
        findingsList.push({ patternId: null, text: `- ${firLabels[id] || id}` });
      });
    }
  }

  // Check if FVM diagnosis is being made (after compartment alterations are added)
  const hasFVM = findingsList.some(f => f.patternId === 'FVM');

  // Gross findings
  if (finding.grossFindings) {
    const fvmGrossIds = ['longCord', 'hypercoiledCord', 'trueKnot', 'marginalCordInsertion', 'velamentousCordInsertion', 'cordStricture', 'thinCord', 'tetheredCord'];
    const grossLabels: Record<string, string> = {
        cordStricture: 'Umbilical cord stricture',
        thinCord: 'Thin umbilical cord',
        tetheredCord: 'Tethered umbilical cord',
    };
    Object.entries(finding.grossFindings).forEach(([id, selected]) => {
      if (selected) {
        if (id === 'greenStaining') {
            findingsList.push({ patternId: 'MECONIUM', text: `- Green stained placenta, grossly consistent with meconium exposure`, id: 'greenStaining' });
        } else {
            const patternId = (hasFVM && fvmGrossIds.includes(id)) ? 'FVM' : 'OTHER';
            
            const text = grossLabels[id] || id.replace(/([A-Z])/g, ' $1').toLowerCase();
            findingsList.push({ patternId, text: `- ${text.charAt(0).toUpperCase() + text.slice(1)}` });
        }
      }
    });
  }

  // Specific Infections
  if (finding.specificInfections) {
    Object.entries(finding.specificInfections).forEach(([id, selected]) => {
      if (selected && id !== 'other') {
        const displayId = id === 'cmv' ? 'CMV' : id === 'hsv' ? 'HSV' : id === 'parvovirus' ? 'Parvovirus' : id.charAt(0).toUpperCase() + id.slice(1);
        if (id === 'candida') {
             findingsList.push({ patternId: 'OTHER', text: `- Funisitis with fungal organisms, morphologically consistent with Candida funisitis` });
        } else {
             findingsList.push({ patternId: 'OTHER', text: `- Findings consistent with ${displayId} placentitis` });
        }
      }
    });
    if (finding.specificInfections.other) {
        findingsList.push({ patternId: 'OTHER', text: `- Other infection: ${finding.specificInfections.other}` });
    }
  }

  if (findingsList.length === 0) {
    lines.push("- No significant gross or histologic pathologic findings identified.");
  } else {
    const grouped = findingsList.reduce((acc, f) => {
        const pid = f.patternId || 'OTHER';
        if (!acc[pid]) acc[pid] = [];
        acc[pid].push({ text: f.text, id: f.id });
        return acc;
    }, {} as Record<string, { text: string; id?: string }[]>);

    // Deterministic, clinically sensible group order so all diagnoses of the same
    // injury pattern print contiguously (meconium findings get their own group).
    const groupOrder = ['MVM', 'FVM', 'AC', 'AA', 'CI', 'DVM', 'VCL', 'MECONIUM', 'OTHER'];
    const orderedGroups = Object.keys(grouped).sort((a, b) => {
        const ia = groupOrder.indexOf(a);
        const ib = groupOrder.indexOf(b);
        return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
    });

    const meconiumOrder: Record<string, number> = {
        'greenStaining': 0,
        'pigment-laden-macrophages': 1,
        'meconium-umbilical-vasculitis': 2,
        'meconium-chorionic-vasculitis': 3,
        'meconium-associated-vascular-necrosis': 4,
    };

    orderedGroups.forEach(pid => {
        const entries = grouped[pid];
        if (pid === 'MECONIUM') {
            const sorted = [...entries].sort(
                (a, b) => (meconiumOrder[a.id ?? ''] ?? 99) - (meconiumOrder[b.id ?? ''] ?? 99)
            );
            lines.push('-- Meconium-related findings:');
            sorted.forEach(e => {
                const cleanText = e.text.startsWith('- ') ? e.text.slice(2) : e.text;
                lines.push(`\t- ${cleanText}`);
            });
        } else if (pid !== 'OTHER') {
            let header: string = injuryPatterns[pid as keyof typeof injuryPatterns].name;
            if (pid === 'MVM') header = "Maternal vascular malperfusion lesions";
            if (pid === 'AA') {
                // Hedged header; note the clinical history when the user flagged abruption
                header = "Findings suggesting acute placental abruption" + (clinicalAbruption ? " [clinical history of abruption]" : "");
            }
            if (pid === 'FVM') {
                const highGradeIds = ['fetal-vessel-thrombosis', 'stem-vessel-obliteration'];
                const isHighGrade = 
                  highGradeIds.some(id => finding.placentalVilli[id]) || 
                  (finding.placentalVilli['avascular-villi'] && finding.avascularVilliSize === 'large');
                
                header = `Fetal vascular malperfusion lesions [${isHighGrade ? 'high grade' : 'low grade'}]`;
            }
            lines.push(`-- ${header}:`);
            entries.forEach(e => {
                const cleanText = e.text.startsWith('- ') ? e.text.slice(2) : e.text.startsWith('-- ') ? e.text.slice(3) : e.text;
                const indentedText = cleanText.split('\n').map((line, idx) => {
                    if (idx === 0) return `\t- ${line}`;
                    return `\t  ${line}`;
                }).join('\n');
                lines.push(indentedText);
            });
        } else {
            entries.forEach(e => lines.push(e.text));
        }
    });
  }

  return lines;
}

export function generateMicroscopicDescription(values: FormValues): string {
  const findingsToProcess = values.isTwin ? values.findings : [values.findings[0]];
  return findingsToProcess.map((finding, index) => 
    generateMicroscopicForFinding(finding, values.isTwin, index)
  ).join('\n\n---\n\n');
}

export function generateFinalDiagnosis(values: FormValues, weightReference: WeightReference = 'pinar'): string {
  const lines: string[] = [];
  const gaWeeks = values.gestationalAgeWeeks || 0;
  const gaDays = values.gestationalAgeDays || 0;
  const gaText = gaDays > 0 ? `${gaWeeks} ${gaDays}/7` : `${gaWeeks}`;
  
  const format = values.reportFormat || 'option1_A';

  let header = '';
  const placentaType = values.isTwin ? 'TWIN PLACENTA' : 'PLACENTA';

  if (format.startsWith('option1_')) {
    const partLetter = format.split('_')[1];
    header = `${partLetter}. ${placentaType}, DELIVERY AT ${gaText} WEEKS:`;
  } else if (format === 'option2') {
    header = `${placentaType}, DELIVERY AT ${gaText} WEEKS:`;
  } else if (format === 'option3') {
    // Option 3: Sentence case
    const sentencePlacentaType = values.isTwin ? 'Twin placenta' : 'Placenta';
    header = `${sentencePlacentaType}, Delivery at ${gaText} weeks:`;
  } else {
    // Fallback
    header = `${placentaType}, DELIVERY AT ${gaText} WEEKS:`;
  }

  lines.push(header);

  if (values.isTwin) {
    lines.push('');
    if (values.chorionicity) lines.push(`- Chorionicity: ${values.chorionicity.charAt(0).toUpperCase() + values.chorionicity.slice(1)}`);
    if (values.amnionicity) lines.push(`- Amnionicity: ${values.amnionicity.charAt(0).toUpperCase() + values.amnionicity.slice(1)}`);
    lines.push('');
  }

  const ga = gaWeeks + gaDays / 7;
  const findingsToProcess = values.isTwin ? values.findings : [values.findings[0]];

  findingsToProcess.forEach((finding, index) => {
    const findingLines = generateFinalDiagnosisForFinding(finding, values.isTwin, index, ga, values.clinicalMSF, values.clinicalAbruption, weightReference);
    lines.push(...findingLines);
    if (index < findingsToProcess.length - 1) lines.push('');
  });

  // Clinical Context Comments
  const comments: string[] = [];
  const hasAbruptionFindings = findingsToProcess.some(f => f.placentalVilli['retroplacental-hematoma'] || f.placentalVilli['intravillous-hemorrhage']);
  if (values.clinicalAbruption && !hasAbruptionFindings) {
      comments.push("Although there is no evidence of abruption on pathologic examination of this placenta, the diagnosis is not excluded. The diagnosis of abruption is best made by the clinician at the time of delivery.");
  }
  if (values.clinicalPAS) {
      comments.push("The clinical concern for placenta accreta spectrum is noted. [The basal plate is disrupted, possibly incomplete, however] no basal plate myometrial fibers are identified.");
  }
  if (values.clinicalIUFD) {
      comments.push("Based on isolated gross and histologic review of the placenta, a cause of demise could not be established.");
  }
  if (values.clinicalIAI) {
      comments.push("No significant acute inflammation is identified.");
  }

  // Meconium-associated vascular necrosis comment
  const hasMAVN = findingsToProcess.some(f => f.umbilicalCord['meconium-associated-vascular-necrosis']);
  if (hasMAVN) {
      comments.push("Meconium associated myonecrosis of umbilical and/or chorionic vessels may be associated with significant adverse perinatal outcomes.");
  }
  
  // High grade chronic villitis comment
  const hasHighGradeVillitis = findingsToProcess.some(f => f.placentalVilli['high-grade-chronic-villitis']);
  if (hasHighGradeVillitis) {
      comments.push("[The pattern of inflammation (absence of neutrophils, plasma cells, granulomas, or abscesses; no viral cytopathic change) is most consistent with a villitis of unknown etiology (VUE), although an infectious villitis cannot be completely excluded.] Chronic villitis/VUE, (particularly when associated with avascular villi and perivillous fibrin deposition) has been associated with adverse outcomes, including fetal growth restriction, and can recur in 10-15% of subsequent pregnancies. Clinical correlation is recommended.");
  }

  // Eosinophilic/T-cell chorionic vasculitis comment
  const hasETCV = findingsToProcess.some(f => f.placentalVilli['eosinophilic-t-cell-vasculitis']);
  if (hasETCV) {
      comments.push("Eosinophilic/T-cell chorionic vasculitis is of unclear clinical significance unless it is associated with a thrombus.");
  }

  // CHIV Comment
  const hasCHIV = findingsToProcess.some(f => f.placentalVilli['chronic-histiocytic-intervillositis']);
  if (hasCHIV) {
      comments.push("Chronic histiocytic intervillositis is associated with adverse pregnancy outcomes, including fetal growth restriction [and stillbirth]. [Can mention elevated serum alkaline phosphatase if present]. There is an increased risk of recurrence in future pregnancies of up to 50%. Clinical correlation and appropriate follow-up are recommended. Referral of the mother to maternal-fetal medicine prior to next pregnancy should be considered.");
  }

  // Massive perivillous fibrin deposition / maternal floor infarct comment
  const hasMPVFDMFI = findingsToProcess.some(f => f.placentalVilli['massive-perivillous-fibrin'] || f.placentalVilli['maternal-floor-infarct']);
  if (hasMPVFDMFI) {
      comments.push("Massive perivillous fibrin deposition/maternal floor infarct is associated with significant perinatal morbidity and mortality, a high recurrence rate in future pregnancies and maternal thrombophilia/anti-phospholipid syndrome and autoimmune disorders. [It can also be rarely associated with infections (CMV, coxsackie virus, syphilis, SARS CoV-2).] Referral of the mother to maternal-fetal-medicine prior to next pregnancy should be considered.");
  }

  // BPMF Comment
  const hasBPMF = findingsToProcess.some(f => f.maternalDecidua['basal-plate-myometrial-fibers']);
  if (hasBPMF) {
      comments.push("Adherent basal plate myometrial fibers (BPMF) are staged according to the Placenta Accreta Spectrum (PAS) Task Force criteria according to the presence (Stage 1) or absence (Stage 2) of intervening decidua. Stage 1 BPMF may be an incidental finding. Stage 2 BPMF may support a diagnosis of non-invasive PAS and may be associated with clinically significant PAS in future pregnancies. Ref: Hecht JL, Baergen R, Ernst LM, et al. Classification and reporting guidelines for the pathology diagnosis of placenta accreta spectrum (PAS) disorders: recommendations from an expert panel. Mod Pathol. 2020 Dec;33(12):2382-2396.");
  }

  // Villous dysmaturity comment
  const hasVillousDysmaturity = findingsToProcess.some(f => f.placentalVilli['villous-dysmaturity']);
  if (hasVillousDysmaturity) {
      comments.push("The villi demonstrate morphologic changes that include a mixture of delayed and accelerated maturation. These changes are associated with maternal diabetes and elevated BMI.");
  }

  // Sickled red blood cells comment
  const hasSickledRBC = findingsToProcess.some(f => f.placentalVilli['sickled-red-blood-cells']);
  if (hasSickledRBC) {
      comments.push("Sickling of maternal red blood cells is present. Appropriate tests for hemoglobinopathy are recommended if not already performed.");
  }

  if (comments.length > 0) {
      lines.push('');
      lines.push('COMMENTS:');
      comments.forEach((c, i) => {
          if (i > 0) lines.push('');
          lines.push(c);
      });
  }

  lines.push('');
  lines.push(`Reference for placental weight percentiles: ${getWeightReferenceCitation(weightReference)}`);

  return lines.join('\n');
}
