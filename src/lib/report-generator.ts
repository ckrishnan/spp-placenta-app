import { FormValues, Findings } from './schema';
import { compartments, injuryPatterns } from './constants';
import { calculatePercentileRank } from './calculations';

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
    if (finding.membranes['pigment-laden-macrophages']) memParts.push("Pigment-laden macrophages are present in the membranes and chorionic plate.");
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
    if (finding.placentalVilli['low-grade-chronic-villitis']) diskParts.push("There is low-grade chronic villitis of unknown etiology (VUE) characterized by a lymphohistiocytic infiltrate involving less than 10 villi per focus.");
    if (finding.placentalVilli['high-grade-chronic-villitis']) diskParts.push("There is high-grade chronic villitis of unknown etiology (VUE) characterized by a lymphohistiocytic infiltrate involving more than 10 villi per focus or multiple foci.");
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

function generateFinalDiagnosisForFinding(finding: Findings, isTwin: boolean, index: number, ga: number): string[] {
  const lines: string[] = [];
  const twinPrefix = isTwin ? `TWIN ${index === 0 ? 'A' : 'B'}:` : '';
  
  if (twinPrefix) lines.push(twinPrefix);

  const birthType = isTwin ? 'twin' : 'singleton';
  const percentile = calculatePercentileRank(Number(finding.placentalWeight), ga, birthType);
  const percentileText = (percentile && percentile !== 'N/A') ? ` (${percentile} percentile)` : '';
  lines.push(`- Placental weight: ${finding.placentalWeight} g${percentileText}`);

  const findingsList: { patternId: string | null; text: string }[] = [];

  // Compartment alterations
  compartments.forEach(compartment => {
    const compartmentValues = finding[compartment.id as keyof Findings] as Record<string, boolean>;
    if (compartmentValues) {
      Object.entries(compartmentValues).forEach(([id, selected]) => {
        if (selected && id !== 'normal') {
          const alteration = compartment.alterations.find(a => a.id === id);
          if (alteration) {
            let text = alteration.reportingText || alteration.name;
            
            if (id === 'acute-chorioamnionitis' || id === 'acute-subchorionitis' || id === 'acute-chorionitis') {
                let diagnosisTitle = "";
                
                // MIR Title based on Matrix
                const mirStage = finding.mirStage || '1';
                const mirGrade = finding.mirGrade || '1';
                
                if (mirStage === '3') {
                    diagnosisTitle = "Necrotizing acute chorioamnionitis";
                } else if (mirStage === '2') {
                    diagnosisTitle = mirGrade === '2' ? "Severe acute chorioamnionitis" : "Acute chorioamnionitis";
                } else {
                    // Stage 1
                    const base = alteration.id === 'acute-chorionitis' ? "Acute chorionitis" : "Acute subchorionitis";
                    diagnosisTitle = mirGrade === '2' ? `Severe ${base.toLowerCase()}` : base;
                }
                
                // Add FIR component to title if present
                if (finding.firStage) {
                    const firStage = finding.firStage;
                    let firLocation = "";
                    if (firStage === '1') firLocation = "umbilical vein/chorionic plate vessels";
                    else if (firStage === '2') firLocation = "umbilical arteries";
                    else if (firStage === '3') firLocation = "umbilical vessels (necrotizing funisitis)";
                    
                    diagnosisTitle += ` [with fetal inflammatory response in ${firLocation}]`;
                }
                
                diagnosisTitle = `- ${diagnosisTitle}:`;
                
                const responseLines: string[] = [];
                if (finding.mirStage) {
                    responseLines.push(`Maternal inflammatory response, stage ${finding.mirStage}${finding.mirGrade ? `, grade ${finding.mirGrade}` : ''}`);
                }
                if (finding.firStage) {
                    responseLines.push(`Fetal inflammatory response, stage ${finding.firStage}${finding.firGrade ? `, grade ${finding.firGrade}` : ''}`);
                }
                
                const fullBlock = [diagnosisTitle, ...responseLines].join('\n');
                // Use null patternId to avoid grouping and keep it as a top-level block
                findingsList.push({ patternId: null, text: fullBlock });
                return;
            }

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

            if (id === 'basal-plate-myometrial-fibers' && (finding.bpmfStage || finding.bpmfLength)) {
                const details: string[] = [];
                if (finding.bpmfStage) details.push(`Stage ${finding.bpmfStage}`);
                if (finding.bpmfLength) details.push(finding.bpmfLength);
                text += ` (${details.join(', ')})`;
            }

            if (id === 'delayed-villous-maturation' && finding.dvmFocality) text += ` (${finding.dvmFocality})`;
            
            if (id === 'villous-dysmaturity') {
                // Independent line for dysmaturity
                findingsList.push({ patternId: 'OTHER', text: `-- Villous dysmaturity (delayed villous maturation with increased syncytial knots), see comment` });
                return;
            }

            if (id === 'retroplacental-hematoma' && (finding.hematomaParenchymalCompression || finding.hematomaOverlyingInfarction)) {
                const details: string[] = [];
                if (finding.hematomaParenchymalCompression) details.push("parenchymal compression");
                if (finding.hematomaOverlyingInfarction) details.push("overlying villous infarction");
                text += ` with ${details.join(' and ')}`;
            }
            
            findingsList.push({ patternId: alteration.patternId, text: `- ${text}` });
          }
        }
      });
    }
  });

  // Check if FVM diagnosis is being made (after compartment alterations are added)
  const hasFVM = findingsList.some(f => f.patternId === 'FVM');

  // Gross findings
  if (finding.grossFindings) {
    Object.entries(finding.grossFindings).forEach(([id, selected]) => {
      if (selected) {
        if (id === 'greenStaining') {
            findingsList.push({ patternId: 'OTHER', text: `- Green stained placenta, grossly consistent with meconium exposure` });
        } else {
            const fvmGrossIds = ['longCord', 'hypercoiledCord', 'trueKnot', 'marginalCordInsertion', 'velamentousCordInsertion'];
            const patternId = (hasFVM && fvmGrossIds.includes(id)) ? 'FVM' : 'OTHER';
            
            const text = id.replace(/([A-Z])/g, ' $1').toLowerCase();
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
             findingsList.push({ patternId: 'OTHER', text: `-- Funisitis with fungal organisms, morphologically consistent with Candida funisitis` });
        } else {
             findingsList.push({ patternId: 'OTHER', text: `-- Findings consistent with ${displayId} placentitis` });
        }
      }
    });
    if (finding.specificInfections.other) {
        findingsList.push({ patternId: 'OTHER', text: `-- Other infection: ${finding.specificInfections.other}` });
    }
  }

  if (findingsList.length === 0) {
    lines.push("- No significant gross or histologic pathologic findings identified.");
  } else {
    const grouped = findingsList.reduce((acc, f) => {
        const pid = f.patternId || 'OTHER';
        if (!acc[pid]) acc[pid] = [];
        acc[pid].push(f.text);
        return acc;
    }, {} as Record<string, string[]>);

    Object.entries(grouped).forEach(([pid, texts]) => {
        if (pid !== 'OTHER') {
            let header: string = injuryPatterns[pid as keyof typeof injuryPatterns].name;
            if (pid === 'MVM') header = "Maternal vascular malperfusion lesions";
            if (pid === 'FVM') {
                const highGradeIds = ['fetal-vessel-thrombosis', 'stem-vessel-obliteration'];
                const isHighGrade = 
                  highGradeIds.some(id => finding.placentalVilli[id]) || 
                  (finding.placentalVilli['avascular-villi'] && finding.avascularVilliSize === 'large');
                
                header = `Fetal vascular malperfusion lesions [${isHighGrade ? 'high grade' : 'low grade'}]`;
            }
            lines.push(`- ${header}:`);
            texts.forEach(t => {
                const cleanText = t.startsWith('- ') ? t.slice(2) : t.startsWith('-- ') ? t.slice(3) : t;
                const indentedText = cleanText.split('\n').map((line, idx) => {
                    if (idx === 0) return `  - ${line}`;
                    return `    ${line}`;
                }).join('\n');
                lines.push(indentedText);
            });
        } else {
            texts.forEach(t => lines.push(t));
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

export function generateFinalDiagnosis(values: FormValues): string {
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
    const findingLines = generateFinalDiagnosisForFinding(finding, values.isTwin, index, ga);
    lines.push(...findingLines);
    if (index < findingsToProcess.length - 1) lines.push('');
  });

  // Clinical Context Comments
  const comments: string[] = [];
  if (values.clinicalAbruption) {
      comments.push("COMMENT FOR ABRUPTION: Although there is no evidence of abruption on pathologic examination of this placenta, the diagnosis is not excluded. The diagnosis of abruption is best made by the clinician at the time of delivery.");
  }
  if (values.clinicalPAS) {
      comments.push("COMMENT FOR PAS: The clinical concern for placenta accreta spectrum is noted. [The basal plate is disrupted, possibly incomplete, however] no basal plate myometrial fibers are identified.");
  }
  if (values.clinicalIUFD) {
      comments.push("COMMENT FOR IUFD: Based on isolated gross and histologic review of the placenta, a cause of demise could not be established.");
  }
  if (values.clinicalIAI) {
      comments.push("COMMENT FOR IAI: No significant acute inflammation is identified.");
  }
  
  // High grade chronic villitis comment
  const hasHighGradeVillitis = findingsToProcess.some(f => f.placentalVilli['high-grade-chronic-villitis']);
  if (hasHighGradeVillitis) {
      comments.push("COMMENT FOR HIGH GRADE CHRONIC VILLITIS: [The pattern of inflammation (absence of neutrophils, plasma cells, granulomas, or abscesses; no viral cytopathic change) is most consistent with a villitis of unknown etiology (VUE), although an infectious villitis cannot be completely excluded.] Chronic villitis/VUE, (particularly when associated with avascular villi and perivillous fibrin deposition) has been associated with adverse outcomes, including fetal growth restriction, and can recur in 10-15% of subsequent pregnancies. Clinical correlation is recommended.");
  }

  // CHIV Comment
  const hasCHIV = findingsToProcess.some(f => f.placentalVilli['chronic-histiocytic-intervillositis']);
  if (hasCHIV) {
      comments.push("COMMENT FOR CHRONIC HISTIOCYTIC INTERVILLOSITIS: Chronic histiocytic intervillositis is associated with adverse pregnancy outcomes, including fetal growth restriction [and stillbirth]. [Can mention elevated serum alkaline phosphatase if present]. There is an increased risk of recurrence in future pregnancies of up to 50%. Clinical correlation and appropriate follow-up are recommended. Referral of the mother to maternal-fetal medicine prior to next pregnancy should be considered.");
  }

  // BPMF Comment
  const hasBPMF = findingsToProcess.some(f => f.maternalDecidua['basal-plate-myometrial-fibers']);
  if (hasBPMF) {
      comments.push("COMMENT FOR BPMF: Adherent basal plate myometrial fibers (BPMF) are staged according to the Placenta Accreta Spectrum (PAS) Task Force criteria according to the presence (Stage 1) or absence (Stage 2) of intervening decidua. Stage 1 BPMF may be an incidental finding. Stage 2 BPMF may support a diagnosis of non-invasive PAS and may be associated with clinically significant PAS in future pregnancies. Ref: Hecht JL, Baergen R, Ernst LM, et al. Classification and reporting guidelines for the pathology diagnosis of placenta accreta spectrum (PAS) disorders: recommendations from an expert panel. Mod Pathol. 2020 Dec;33(12):2382-2396.");
  }

  // Villous dysmaturity comment
  const hasVillousDysmaturity = findingsToProcess.some(f => f.placentalVilli['villous-dysmaturity']);
  if (hasVillousDysmaturity) {
      comments.push("COMMENT FOR VILLOUS DYSMATURITY: The villi demonstrate morphologic changes that include a mixture of delayed and accelerated maturation. These changes are associated with maternal diabetes and elevated BMI.");
  }

  if (comments.length > 0) {
      lines.push('');
      lines.push('COMMENTS:');
      comments.forEach(c => lines.push(c));
  }

  lines.push('');
  lines.push('Reference for placental weight percentiles: Pinar H. et al. Pediatr Pathol Lab med 1996; 16:901-7.');

  return lines.join('\n');
}
