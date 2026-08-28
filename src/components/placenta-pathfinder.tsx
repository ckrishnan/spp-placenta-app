

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Copy, Info, Loader2, Sparkles, Bug, BookImage } from "lucide-react";
import Image from "next/image";
import { useState, useTransition, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { AtlasModal } from "@/components/atlas-modal";
import { HowToModal } from "@/components/how-to-modal";
import { ReferencesModal } from "@/components/references-modal";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useFormField,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { calculatePercentileRank, type WeightReference } from "@/lib/calculations";
import { compartments, injuryPatterns, specificInfections } from "@/lib/constants";
import { atlasData } from "@/lib/atlas";
import { formSchema, type FormValues, type Findings } from "@/lib/schema";
import { generateMicroscopicDescription, generateFinalDiagnosis } from "@/lib/report-generator";
import { PlaceHolderImages, type ImagePlaceholder } from "@/lib/placeholder-images";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "./ui/carousel";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const imageMap = new Map(PlaceHolderImages.map(img => [img.id, img]));

// Build a compartment value object with every alteration explicitly set to false.
// Explicit keys are required so that form.reset() reliably clears the data-driven
// checkbox fields (an empty object leaves them untouched on reset).
function emptyCompartment(id: 'umbilicalCord' | 'membranes' | 'placentalVilli' | 'maternalDecidua'): Record<string, boolean> {
  const compartment = compartments.find(c => c.id === id);
  if (!compartment) return {};
  return Object.fromEntries(compartment.alterations.map(a => [a.id, false]));
}

export function PlacentaPathfinder() {
  const [report, setReport] = useState("");
  const [microscopicDescription, setMicroscopicDescription] = useState("");
  const [percentiles, setPercentiles] = useState<[string | null, string | null]>([null, null]);
  const [activeTwinIndex, setActiveTwinIndex] = useState(0);
  const [weightReference, setWeightReference] = useState<WeightReference>('pinar');
  const [isCopied, setIsCopied] = useState(false);
  const [isMicroscopicCopied, setIsMicroscopicCopied] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const defaultFindings: Findings = {
    placentalWeight: undefined as any,
    completenessOfMaternalSurface: undefined,
    grossFindings: {
      marginalCordInsertion: false,
      velamentousCordInsertion: false,
      circumvallateMembraneInsertion: false,
      accessoryLobe: false,
      twoVesselCord: false,
      hypocoiledCord: false,
      longCord: false,
      hypercoiledCord: false,
      trueKnot: false,
      cordStricture: false,
      thinCord: false,
      tetheredCord: false,
      greenStaining: false,
    },
    umbilicalCord: emptyCompartment('umbilicalCord'),
    membranes: emptyCompartment('membranes'),
    placentalVilli: emptyCompartment('placentalVilli'),
    maternalDecidua: emptyCompartment('maternalDecidua'),
    mirStage: undefined,
    mirGrade: undefined,
    firStage: undefined,
    firGrade: undefined,
    bacteriaPresent: '',
    gramStainResults: '',
    gmsResults: '',
    infarctSize: '',
    infarctExtent: '',
    hematomaParenchymalCompression: false,
    hematomaOverlyingInfarction: false,
    thrombusType: undefined,
    thrombusLocation: undefined,
    intramuralFibrinLocation: undefined,
    avascularVilliSize: undefined,
    vsvkSize: undefined,
    bpmfFocality: undefined,
    bpmfLength: '',
    bpmfStage: undefined,
    dvmFocality: undefined,
    chronicVillitisExtent: undefined,
    villitisStemVesselObliteration: false,
    villitisAvascularVilli: false,
    villitisPerivillousFibrin: false,
    pigmentMacrophagesMembranes: false,
    pigmentMacrophagesChorionicPlate: false,
    pigmentMacrophagesChorionicVesselWalls: false,
    specificInfections: {
        candida: false,
        cmv: false,
        hsv: false,
        parvovirus: false,
        actinomyces: false,
        other: '',
    },
    additionalMicroscopicFindings: "",
  };

  const defaultValues: Partial<FormValues> = {
    gestationalAgeWeeks: undefined,
    gestationalAgeDays: undefined,
    isTwin: false,
    chorionicity: undefined,
    amnionicity: undefined,
    modeOfDelivery: undefined,
    clinicalAbruption: false,
    clinicalPAS: false,
    clinicalIUFD: false,
    clinicalIAI: false,
    clinicalMSF: false,
    reportFormat: 'option1_A',
    findings: [defaultFindings, { ...defaultFindings }],
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: 'onBlur',
  });

  const { watch } = form;
  const isTwin = watch("isTwin");

  // Watch the active twin's finding so we can validate acute chorio MIR/FIR staging
  // against the findings the user has actually selected.
  const activeFinding = useWatch({ control: form.control, name: `findings.${activeTwinIndex}` }) as Findings | undefined;

  // Expected stages derived from the selected membrane/cord findings.
  // MIR: 1 = subchorionitis/chorionitis, 2 = chorioamnionitis, 3 = necrotizing chorioamnionitis.
  // FIR: 1 = chorionic vasculitis/phlebitis, 2 = arteritis, 3 = necrotizing funisitis.
  const mirChorioamnionitis = !!activeFinding?.membranes?.['acute-chorioamnionitis'];
  const hasMirFinding =
      mirChorioamnionitis ||
      !!activeFinding?.membranes?.['acute-chorionitis'] ||
      !!activeFinding?.membranes?.['acute-subchorionitis'];
  const derivedMirStage = mirChorioamnionitis ? '2' : '1';
  const mirAllowedStages = mirChorioamnionitis ? ['2', '3'] : ['1'];

  const hasFirNecrotizing = !!activeFinding?.umbilicalCord?.['necrotizing-funisitis'];
  const hasFirArteritis = !!activeFinding?.umbilicalCord?.['umbilical-arteritis'];
  const hasFirPhlebitisOrVasculitis =
      !!activeFinding?.umbilicalCord?.['umbilical-phlebitis'] ||
      !!activeFinding?.membranes?.['chorionic-vasculitis'];
  const hasFirFinding = hasFirNecrotizing || hasFirArteritis || hasFirPhlebitisOrVasculitis;
  const derivedFirStage = hasFirNecrotizing ? '3' : hasFirArteritis ? '2' : hasFirPhlebitisOrVasculitis ? '1' : null;
  const firAllowedStages = hasFirNecrotizing ? ['3'] : hasFirArteritis ? ['2'] : hasFirPhlebitisOrVasculitis ? ['1'] : ['1', '2', '3'];

  // Internal validation: keep MIR/FIR stages consistent with the selected findings.
  // Conflicting options are disabled in the dropdowns below, and any previously entered
  // stage that no longer matches is auto-corrected (or cleared once the finding is removed).
  useEffect(() => {
    if (activeFinding?.mirStage) {
      if (!hasMirFinding) {
        form.setValue(`findings.${activeTwinIndex}.mirStage`, '');
      } else if (!mirAllowedStages.includes(activeFinding.mirStage)) {
        form.setValue(`findings.${activeTwinIndex}.mirStage`, derivedMirStage);
      }
    }
    if (activeFinding?.firStage) {
      if (!hasFirFinding) {
        form.setValue(`findings.${activeTwinIndex}.firStage`, '');
      } else if (derivedFirStage && !firAllowedStages.includes(activeFinding.firStage)) {
        form.setValue(`findings.${activeTwinIndex}.firStage`, derivedFirStage);
      }
    }
  }, [activeFinding, activeTwinIndex, hasMirFinding, hasFirFinding, mirChorioamnionitis, hasFirNecrotizing, hasFirArteritis, hasFirPhlebitisOrVasculitis, derivedMirStage, derivedFirStage, form]);

  // Load the persisted weight reference preference (survives browser close via localStorage).
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem('placentaWeightReference');
      if (stored === 'pinar' || stored === 'boyd') {
        setWeightReference(stored);
      }
    } catch {
      // localStorage unavailable; fall back to Pinar et al.
    }
  }, []);

  const handleWeightReferenceChange = (value: WeightReference) => {
    // Radix Select can fire onValueChange with an empty/invalid value on mount;
    // ignore anything that isn't a supported reference so we never clobber the
    // persisted selection.
    if (value !== 'pinar' && value !== 'boyd') return;

    setWeightReference(value);
    try {
      window.localStorage.setItem('placentaWeightReference', value);
    } catch {
      // localStorage unavailable; keep in-memory selection
    }

    // Recompute the displayed percentiles and regenerate any existing report
    // using the newly selected reference.
    const values = form.getValues();
    const weeks = Number(values.gestationalAgeWeeks);
    if (weeks >= 19 && values.findings) {
      const birthType = values.isTwin ? 'twin' : 'singleton';
      const ga = weeks + (Number(values.gestationalAgeDays) || 0) / 7;
      const newPercentiles: [string | null, string | null] = [null, null];
      values.findings.forEach((finding, index) => {
        if (finding && finding.placentalWeight) {
          const weight = Number(finding.placentalWeight);
          if (weight > 0) {
            newPercentiles[index] = calculatePercentileRank(weight, ga, birthType, value);
          }
        }
      });
      setPercentiles(newPercentiles);
    } else {
      setPercentiles([null, null]);
    }

    if (report) {
      const finalDiagnosis = generateFinalDiagnosis(values as FormValues, value);
      setReport(finalDiagnosis);
    }
  };

  useEffect(() => {
    const subscription = watch((value) => {
      const { gestationalAgeWeeks, gestationalAgeDays, isTwin, findings, reportFormat } = value;
      
      const weeks = Number(gestationalAgeWeeks);
      const birthType = isTwin ? 'twin' : 'singleton';

      if (weeks >= 19 && findings) {
        const ga = weeks + (Number(gestationalAgeDays) || 0) / 7;
        const newPercentiles: [string | null, string | null] = [null, null];
        
        findings.forEach((finding, index) => {
            if (finding && finding.placentalWeight) {
                const weight = Number(finding.placentalWeight);
                if (weight > 0) {
                  const p = calculatePercentileRank(weight, ga, birthType, weightReference);
                  newPercentiles[index] = p;
                }
            }
        });
        setPercentiles(newPercentiles);
      } else {
        setPercentiles([null, null]);
      }

      // Regenerate report if it already exists and formatting options changed
      if (report) {
        const finalDiagnosis = generateFinalDiagnosis(value as FormValues, weightReference);
        setReport(finalDiagnosis);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, report, weightReference]);


  const onSubmit = (data: FormValues) => {
    startTransition(() => {
      // Local report generation
      const finalDiagnosis = generateFinalDiagnosis(data, weightReference);
      const microscopic = generateMicroscopicDescription(data);
      
      setReport(finalDiagnosis);
      setMicroscopicDescription(microscopic);
    });
  };

  const onInvalid = (errors: any) => {
    console.error('Form validation errors:', JSON.stringify(errors, null, 2));
    toast({
      title: "Validation Error",
      description: "Please ensure GA Weeks and Placental Weight are filled correctly.",
      variant: "destructive",
    });
  };
  
  const handleCopy = (textToCopy: string, type: 'final' | 'micro' = 'final') => {
    if (!textToCopy) return;
    try {
      navigator.clipboard.writeText(textToCopy);
      if (type === 'final') {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      } else {
        setIsMicroscopicCopied(true);
        setTimeout(() => setIsMicroscopicCopied(false), 2000);
      }
      toast({ title: 'Copied to clipboard!' });
    } catch (err) {
        console.error('Failed to copy text: ', err);
        toast({
            title: 'Copy Failed',
            description: 'Could not copy text to clipboard. Please copy manually.',
            variant: 'destructive',
        });
    }
  };
  
  const handleMarkAllNormal = () => {
    const currentFindings = form.getValues(`findings.${activeTwinIndex}`);
    
    if (currentFindings.grossFindings) {
      Object.keys(currentFindings.grossFindings).forEach(key => {
          form.setValue(`findings.${activeTwinIndex}.grossFindings.${key as keyof typeof currentFindings.grossFindings}` as any, false);
      });
    }

    compartments.forEach(c => {
      const compartmentValues = currentFindings[c.id as keyof Findings] as Record<string, boolean>;
      if (compartmentValues) {
        Object.keys(compartmentValues).forEach(key => {
          form.setValue(`findings.${activeTwinIndex}.${c.id}.${key}` as any, false);
        })
      }
    });

    const infections = currentFindings.specificInfections || {};
    Object.keys(infections).forEach(key => {
        form.setValue(`findings.${activeTwinIndex}.specificInfections.${key}` as any, key === 'other' ? '' : false);
    });

    // Villitis-associated secondary changes
    form.setValue(`findings.${activeTwinIndex}.villitisStemVesselObliteration` as any, false);
    form.setValue(`findings.${activeTwinIndex}.villitisAvascularVilli` as any, false);
    form.setValue(`findings.${activeTwinIndex}.villitisPerivillousFibrin` as any, false);

    compartments.forEach(compartment => {
      form.setValue(`findings.${activeTwinIndex}.${compartment.id}.normal` as any, true, { shouldValidate: true });
    });

     setReport('');
     setMicroscopicDescription("");
  };

  const handleClearAllSelections = () => {
    // Full reset: clears header, clinical context, gross + microscopic findings,
    // specific infections, and twin settings for all sections.
    form.reset(defaultValues);
    setActiveTwinIndex(0);
    setReport('');
    setMicroscopicDescription("");
  };


  return (
    <TooltipProvider>
      <div className="container mx-auto max-w-5xl p-4">
        <header className="text-center mb-6">
          <h1 className="font-headline text-4xl md:text-5xl text-primary-foreground/90">
            Placenta Reporting
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            A tool for the general pathologist
          </p>
          <div className="flex justify-center gap-4 mt-6">
            <HowToModal />
            <AtlasModal />
            <ReferencesModal />
          </div>
        </header>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} className="space-y-6">
            <Card className="shadow-lg animate-in fade-in-0 zoom-in-95 duration-500">
              <CardHeader>
                <CardTitle>Header</CardTitle>
                <CardDescription>
                  Enter the basic details for the placental examination.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {isTwin && (
                  <Tabs value={activeTwinIndex.toString()} onValueChange={(v) => setActiveTwinIndex(parseInt(v))} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="0">Twin A</TabsTrigger>
                      <TabsTrigger value="1">Twin B</TabsTrigger>
                    </TabsList>
                  </Tabs>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="gestationalAgeWeeks"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>GA (Weeks)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="e.g., 38" {...field} value={field.value ?? ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="gestationalAgeDays"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>GA (Days)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="e.g., 2" {...field} value={field.value ?? ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`findings.${activeTwinIndex}.placentalWeight`}
                    render={({ field }) => (
                      <FormItem>
                         <FormLabel>Placental Weight (g)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="e.g., 450" {...field} value={field.value ?? ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="isTwin"
                    render={({ field }) => (
                      <FormItem className="p-0 rounded-md border sm:col-span-1">
                        <FormLabel className="flex flex-row items-center space-x-3 space-y-0 p-4 font-normal cursor-pointer">
                          <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={(checked) => {
                              field.onChange(checked);
                              if (!checked) setActiveTwinIndex(0);
                            }} />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <span>Twin Pregnancy</span>
                          </div>
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="modeOfDelivery"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mode of Delivery <span className="text-muted-foreground font-normal">(Optional)</span></FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select mode of delivery" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="vaginal">Vaginal</SelectItem>
                            <SelectItem value="cesarean">Cesarean Section</SelectItem>
                          </SelectContent>
                         </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormItem>
                    <FormLabel>Weight Reference <span className="text-muted-foreground font-normal">(persisted)</span></FormLabel>
                    <Select value={weightReference} onValueChange={(v) => handleWeightReferenceChange(v as WeightReference)}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select weight reference" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pinar">Pinar et al.</SelectItem>
                        <SelectItem value="boyd">Boyd et al.</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription className="text-xs">
                      Choose the singleton weight reference used for percentile calculations. Your choice is remembered on this device.
                    </FormDescription>
                  </FormItem>
                  <FormField
                    control={form.control}
                    name={`findings.${activeTwinIndex}.completenessOfMaternalSurface`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Completeness of Maternal Surface <span className="text-muted-foreground font-normal">(Optional)</span></FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select completeness" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="complete">Complete</SelectItem>
                            <SelectItem value="incomplete">Incomplete</SelectItem>
                            <SelectItem value="disrupted">Disrupted</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4">
                <div className="text-sm text-muted-foreground font-medium">
                  Estimated Placental Weight Percentile: {' '}
                  <span className="font-bold text-accent-foreground">{percentiles[activeTwinIndex] ?? 'N/A'}</span>
                </div>
              </CardFooter>
            </Card>

            <Accordion type="multiple" className="w-full space-y-6" defaultValue={['clinical-context', 'microscopic-findings']}>
              {isTwin && (
                 <Card className="shadow-lg animate-in fade-in-0 zoom-in-95 duration-500 overflow-hidden">
                    <AccordionItem value="twin-findings" className="border-none">
                        <AccordionTrigger className="p-4 hover:no-underline">
                          <div className="w-full text-left">
                            <CardTitle>Twin Findings</CardTitle>
                            <CardDescription>
                              Specify details for the twin placenta.
                            </CardDescription>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="p-4 pt-0">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="chorionicity"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Chorionicity</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select chorionicity" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="monochorionic">Monochorionic</SelectItem>
                                      <SelectItem value="dichorionic">Dichorionic</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="amnionicity"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Amnionicity</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select amnionicity" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="monoamniotic">Monoamniotic</SelectItem>
                                      <SelectItem value="diamniotic">Diamniotic</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </AccordionContent>
                    </AccordionItem>
                 </Card>
              )}

              <Card className="shadow-lg animate-in fade-in-0 zoom-in-95 duration-500 delay-50 overflow-hidden">
                <AccordionItem value="clinical-context" className="border-none">
                    <AccordionTrigger className="p-4 hover:no-underline">
                      <div className="w-full text-left">
                        <CardTitle>Clinical Context</CardTitle>
                        <CardDescription>Select any relevant clinical scenarios to add standard comments to the report.</CardDescription>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="p-4 pt-0">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="clinicalAbruption"
                          render={({ field }) => (
                            <FormItem className="rounded-md border p-0">
                              <FormLabel className="flex flex-row items-center justify-between p-4 font-normal cursor-pointer w-full">
                                <span className="flex items-center space-x-3">
                                  <FormControl>
                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                  </FormControl>
                                  <div className="space-y-1 leading-none">
                                    <span>Suspicion of abruption (no pathologic evidence)</span>
                                  </div>
                                </span>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                                      <Info className="h-4 w-4 text-muted-foreground" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="max-w-xs">Select if abruption was suspected clinically but no pathologic findings are selected.</p>
                                  </TooltipContent>
                                </Tooltip>
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="clinicalPAS"
                          render={({ field }) => (
                             <FormItem className="rounded-md border p-0">
                              <FormLabel className="flex flex-row items-center justify-between p-4 font-normal cursor-pointer w-full">
                                <span className="flex items-center space-x-3">
                                  <FormControl>
                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                  </FormControl>
                                  <div className="space-y-1 leading-none">
                                    <span>Suspicion for PAS (no BPMF identified)</span>
                                  </div>
                                </span>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                                      <Info className="h-4 w-4 text-muted-foreground" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="max-w-xs">Select if placenta accreta spectrum was suspected but no myometrial fibers were seen.</p>
                                  </TooltipContent>
                                </Tooltip>
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="clinicalIAI"
                          render={({ field }) => (
                             <FormItem className="rounded-md border p-0">
                              <FormLabel className="flex flex-row items-center justify-between p-4 font-normal cursor-pointer w-full">
                                <span className="flex items-center space-x-3">
                                  <FormControl>
                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                  </FormControl>
                                  <div className="space-y-1 leading-none">
                                    <span>Suspicion of IAI (no ACA identified)</span>
                                  </div>
                                </span>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                                      <Info className="h-4 w-4 text-muted-foreground" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="max-w-xs">Select if intra-amniotic infection was suspected but no acute inflammation is seen.</p>
                                  </TooltipContent>
                                </Tooltip>
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="clinicalIUFD"
                          render={({ field }) => (
                             <FormItem className="rounded-md border p-0">
                              <FormLabel className="flex flex-row items-center justify-between p-4 font-normal cursor-pointer w-full">
                                <span className="flex items-center space-x-3">
                                  <FormControl>
                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                  </FormControl>
                                  <div className="space-y-1 leading-none">
                                    <span>Intrauterine fetal demise (no cause identified)</span>
                                  </div>
                                </span>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                                      <Info className="h-4 w-4 text-muted-foreground" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="max-w-xs">Select for IUFD cases where the placental examination does not reveal a definitive cause.</p>
                                  </TooltipContent>
                                </Tooltip>
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="clinicalMSF"
                          render={({ field }) => (
                             <FormItem className="rounded-md border p-0">
                              <FormLabel className="flex flex-row items-center justify-between p-4 font-normal cursor-pointer w-full">
                                <span className="flex items-center space-x-3">
                                  <FormControl>
                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                  </FormControl>
                                  <div className="space-y-1 leading-none">
                                    <span>Clinical history of meconium-stained fluid</span>
                                  </div>
                                </span>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                                      <Info className="h-4 w-4 text-muted-foreground" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="max-w-xs">Select to add "consistent with meconium" to relevant findings.</p>
                                  </TooltipContent>
                                </Tooltip>
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                      </div>
                    </AccordionContent>
                </AccordionItem>
              </Card>

              <Card className="shadow-lg animate-in fade-in-0 zoom-in-95 duration-500 delay-100 overflow-hidden">
                 <AccordionItem value="gross-findings" className="border-none">
                    <AccordionTrigger className="p-4 hover:no-underline">
                      <div className="w-full text-left">
                        <CardTitle>Gross Findings (Optional)</CardTitle>
                        <CardDescription>Select any relevant gross findings observed.</CardDescription>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="p-4 pt-0">
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                          <FormField control={form.control} name={`findings.${activeTwinIndex}.grossFindings.marginalCordInsertion`} render={({ field }) => (
                             <FormItem className="p-0 rounded-md border">
                              <FormLabel className="flex flex-row items-start space-x-3 space-y-0 p-3 font-normal cursor-pointer h-full">
                                <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                <span className="flex-1">Marginal cord insertion</span>
                              </FormLabel>
                            </FormItem>
                          )} />
                          <FormField control={form.control} name={`findings.${activeTwinIndex}.grossFindings.velamentousCordInsertion`} render={({ field }) => (
                            <FormItem className="p-0 rounded-md border">
                              <FormLabel className="flex flex-row items-start space-x-3 space-y-0 p-3 font-normal cursor-pointer h-full">
                                <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                <span className="flex-1">Velamentous cord insertion</span>
                              </FormLabel>
                            </FormItem>
                          )} />
                          <FormField control={form.control} name={`findings.${activeTwinIndex}.grossFindings.circumvallateMembraneInsertion`} render={({ field }) => (
                            <FormItem className="p-0 rounded-md border">
                              <FormLabel className="flex flex-row items-start space-x-3 space-y-0 p-3 font-normal cursor-pointer h-full">
                                <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                <span className="flex-1">Circumvallate membrane insertion</span>
                              </FormLabel>
                            </FormItem>
                          )} />
                          <FormField control={form.control} name={`findings.${activeTwinIndex}.grossFindings.accessoryLobe`} render={({ field }) => (
                             <FormItem className="p-0 rounded-md border">
                              <FormLabel className="flex flex-row items-start space-x-3 space-y-0 p-3 font-normal cursor-pointer h-full">
                                <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                <span className="flex-1">Accessory lobe</span>
                              </FormLabel>
                            </FormItem>
                          )} />
                          <FormField control={form.control} name={`findings.${activeTwinIndex}.grossFindings.twoVesselCord`} render={({ field }) => (
                            <FormItem className="p-0 rounded-md border">
                              <FormLabel className="flex flex-row items-start space-x-3 space-y-0 p-3 font-normal cursor-pointer h-full">
                                <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                <span className="flex-1">Two-vessel cord (SUA)</span>
                              </FormLabel>
                            </FormItem>
                          )} />
                          <FormField control={form.control} name={`findings.${activeTwinIndex}.grossFindings.hypocoiledCord`} render={({ field }) => (
                            <FormItem className="p-0 rounded-md border">
                              <FormLabel className="flex flex-row items-start space-x-3 space-y-0 p-3 font-normal cursor-pointer h-full">
                                <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                <span className="flex-1">Hypocoiled cord</span>
                              </FormLabel>
                            </FormItem>
                          )} />
                          <FormField control={form.control} name={`findings.${activeTwinIndex}.grossFindings.longCord`} render={({ field }) => (
                            <FormItem className="p-0 rounded-md border">
                              <FormLabel className="flex flex-row items-start space-x-3 space-y-0 p-3 font-normal cursor-pointer h-full">
                                <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                <span className="flex-1">Long cord</span>
                              </FormLabel>
                            </FormItem>
                          )} />
                          <FormField control={form.control} name={`findings.${activeTwinIndex}.grossFindings.hypercoiledCord`} render={({ field }) => (
                             <FormItem className="p-0 rounded-md border">
                              <FormLabel className="flex flex-row items-start space-x-3 space-y-0 p-3 font-normal cursor-pointer h-full">
                                <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                <span className="flex-1">Hypercoiled cord</span>
                              </FormLabel>
                            </FormItem>
                          )} />
                          <FormField control={form.control} name={`findings.${activeTwinIndex}.grossFindings.trueKnot`} render={({ field }) => (
                            <FormItem className="p-0 rounded-md border">
                              <FormLabel className="flex flex-row items-start space-x-3 space-y-0 p-3 font-normal cursor-pointer h-full">
                                <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                <span className="flex-1">True knot</span>
                              </FormLabel>
                            </FormItem>
                          )} />
                          <FormField control={form.control} name={`findings.${activeTwinIndex}.grossFindings.cordStricture`} render={({ field }) => (
                            <FormItem className="p-0 rounded-md border">
                              <FormLabel className="flex flex-row items-start space-x-3 space-y-0 p-3 font-normal cursor-pointer h-full">
                                <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                <span className="flex-1">Umbilical cord stricture</span>
                              </FormLabel>
                            </FormItem>
                          )} />
                          <FormField control={form.control} name={`findings.${activeTwinIndex}.grossFindings.thinCord`} render={({ field }) => (
                            <FormItem className="p-0 rounded-md border">
                              <FormLabel className="flex flex-row items-start space-x-3 space-y-0 p-3 font-normal cursor-pointer h-full">
                                <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                <span className="flex-1">Thin umbilical cord</span>
                              </FormLabel>
                            </FormItem>
                          )} />
                          <FormField control={form.control} name={`findings.${activeTwinIndex}.grossFindings.tetheredCord`} render={({ field }) => (
                            <FormItem className="p-0 rounded-md border">
                              <FormLabel className="flex flex-row items-start space-x-3 space-y-0 p-3 font-normal cursor-pointer h-full">
                                <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                <span className="flex-1">Tethered umbilical cord</span>
                              </FormLabel>
                            </FormItem>
                          )} />
                          <FormField control={form.control} name={`findings.${activeTwinIndex}.grossFindings.greenStaining`} render={({ field }) => (
                            <FormItem className="p-0 rounded-md border">
                              <FormLabel className="flex flex-row items-start space-x-3 space-y-0 p-3 font-normal cursor-pointer h-full">
                                <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                <span className="flex-1">Green staining</span>
                              </FormLabel>
                            </FormItem>
                          )} />
                      </div>
                    </AccordionContent>
                  </AccordionItem>
              </Card>

              <Card className="shadow-lg animate-in fade-in-0 zoom-in-95 duration-500 delay-150 overflow-hidden">
                <AccordionItem value="microscopic-findings" className="border-none">
                    <AccordionTrigger className="p-4 hover:no-underline">
                      <div className="w-full text-left">
                        <CardTitle>Microscopic Findings</CardTitle>
                        <CardDescription>
                          Select all applicable alterations organized by compartment.
                        </CardDescription>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="p-4 pt-0">
                      <div className="flex flex-col md:flex-row gap-8">
                        <div className="w-full md:w-56 flex-shrink-0 space-y-2">
                            <h4 className="font-semibold border-b pb-2 mb-4">Injury Pattern Legend</h4>
                            {Object.values(injuryPatterns).map(pattern => (
                                <div 
                                    key={pattern.id} 
                                    className={cn(
                                        "text-sm px-3 py-1.5 rounded-md font-medium text-foreground/90",
                                        pattern.bgColor
                                    )}
                                >
                                    {pattern.name}
                                </div>
                            ))}
                        </div>

                        <div className="flex-1">
                            <div className="flex justify-start gap-2 mb-6">
                              <Button type="button" variant="outline" size="sm" onClick={() => handleMarkAllNormal()}>
                                  Mark All as Normal
                              </Button>
                              <Button type="button" variant="outline" size="sm" onClick={() => handleClearAllSelections()}>
                                  Clear All Selections
                              </Button>
                            </div>
                            <div className="space-y-8">
                              {compartments.map((compartment) => {
                                const normalAlteration = compartment.alterations.find(alt => alt.id === 'normal');
                                const otherAlterations = compartment.alterations.filter(alt => alt.id !== 'normal');
                                
                                const orderedAlterations = [
                                    ...(normalAlteration ? [normalAlteration] : []),
                                    ...Object.values(injuryPatterns).flatMap(pattern => 
                                        otherAlterations.filter(alt => alt.patternId === pattern.id)
                                    ),
                                    ...otherAlterations.filter(alt => !alt.patternId && !Object.values(injuryPatterns).some(p => p.id === alt.patternId))
                                ].filter((value, index, self) =>
                                    index === self.findIndex((t) => (
                                        t.id === value.id
                                    ))
                                );


                                return (
                                <div key={compartment.id}>
                                  <h3 className="text-lg font-semibold flex items-center gap-3 mb-4 border-b pb-2">
                                    <compartment.icon />
                                    {compartment.name}
                                  </h3>
                                  <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                                    {orderedAlterations.map((alteration) => {
                                      const pattern = alteration.patternId ? injuryPatterns[alteration.patternId] : null;
                                      const imageIds = atlasData[compartment.id + ":" + alteration.id] || [];
                                      const images = imageIds.map(id => imageMap.get(id)).filter((img): img is ImagePlaceholder => !!img);
                                      
                                      return (
                                        <FormField
                                          key={alteration.id}
                                          control={form.control}
                                          name={`findings.${activeTwinIndex}.${compartment.id}.${alteration.id}`}
                                          render={({ field }) => (
                                              <FormItem
                                                className={cn(
                                                  "rounded-lg border flex flex-col",
                                                  pattern ? pattern.bgColor : "bg-transparent"
                                                )}
                                              >
                                                <div className="flex-grow p-2">
                                                    <div className="flex items-center justify-between">
                                                        <FormLabel htmlFor={field.name} className="font-normal cursor-pointer text-sm leading-tight flex-grow flex items-center space-x-3">
                                                            <FormControl>
                                                                <Checkbox
                                                                id={field.name}
                                                                checked={field.value as boolean}
                                                                onCheckedChange={(checked) => {
                                                                    field.onChange(checked);
                                                                    if (alteration.id === 'normal' && checked) {
                                                                        compartment.alterations.forEach((alt) => {
                                                                            if (alt.id !== 'normal') {
                                                                            form.setValue(`findings.${activeTwinIndex}.${compartment.id}.${alt.id}` as any, false);
                                                                            }
                                                                        });
                                                                    } else if (checked) {
                                                                        form.setValue(`findings.${activeTwinIndex}.${compartment.id}.normal` as any, false);
                                                                    }
                                                                }}
                                                                />
                                                            </FormControl>
                                                            <span className="flex-grow">{alteration.name}</span>
                                                        </FormLabel>
                                                        <div className="shrink-0 ml-auto pl-2">
                                                            <Popover>
                                                            <PopoverTrigger
                                                                asChild
                                                            >
                                                                <Button variant="ghost" size="icon" className="h-6 w-6">
                                                                <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
                                                                </Button>
                                                            </PopoverTrigger>
                                                            <PopoverContent side="top" className="w-96 max-w-[calc(100vw-2rem)]" align="start">
                                                                <div className="grid gap-4">
                                                                    <div className="space-y-2">
                                                                        <h3 className="font-medium leading-none">{alteration.name}</h3>
                                                                        <p className="text-sm text-muted-foreground whitespace-pre-line max-h-56 overflow-y-auto pr-1 leading-relaxed">
                                                                            {alteration.description}
                                                                        </p>
                                                                    </div>
                                                                    {(alteration.id === 'acute-chorioamnionitis' || alteration.id === 'acute-chorionitis' || alteration.id === 'acute-subchorionitis') && (
                                                                        <Button
                                                                            type="button"
                                                                            variant="outline"
                                                                            size="sm"
                                                                            className="w-full"
                                                                            onClick={() => {
                                                                                window.dispatchEvent(new CustomEvent("open-atlas-chapter", { detail: "acute chorioamnionitis" }));
                                                                            }}
                                                                        >
                                                                            <BookImage className="mr-2 h-4 w-4" />
                                                                            View MIR/FIR staging images in the atlas
                                                                        </Button>
                                                                    )}
                                                                    {images && images.length > 0 ? (
                                                                        <Carousel className="w-full relative">
                                                                        <CarouselContent>
                                                                            {images.map((image, index) => (
                                                                            <CarouselItem key={index}>
                                                                                <div className="rounded-md overflow-hidden border">
                                                                                <Image
                                                                                    src={image.imageUrl}
                                                                                    alt={image.description}
                                                                                    width={300}
                                                                                    height={225}
                                                                                    className="object-cover w-full"
                                                                                    data-ai-hint={image.imageHint}
                                                                                />
                                                                                </div>
                                                                            </CarouselItem>
                                                                            ))}
                                                                        </CarouselContent>
                                                                        {images.length > 1 && (
                                                                            <>
                                                                            <CarouselPrevious className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-8" />
                                                                            <CarouselNext className="absolute right-0 top-1/2 -translate-y-1/2 h-8 w-8" />
                                                                            </>
                                                                        )}
                                                                        </Carousel>
                                                                    ) : (
                                                                        (alteration.id === 'massive-perivillous-fibrin' || alteration.id === 'maternal-floor-infarct') && (
                                                                            <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 p-2 bg-amber-50 dark:bg-amber-900/20 rounded-md">
                                                                                Reminder: Massive is &gt;50% of parenchyma. Maternal Floor Infarct is &gt;3mm thick band of fibrin at basal plate. Review gross images.
                                                                            </p>
                                                                        )
                                                                    )}
                                                                </div>
                                                            </PopoverContent>
                                                            </Popover>
                                                        </div>
                                                    </div>
                                                    </div>
                                                    {(alteration.id === 'acute-chorioamnionitis' || alteration.id === 'acute-subchorionitis' || alteration.id === 'acute-chorionitis') && field.value && (
                                                      <div className="space-y-4 p-2 pt-2 mt-2 border-t">
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <FormField control={form.control} name={`findings.${activeTwinIndex}.mirStage`} render={({ field }) => (
                                                                <FormItem><FormLabel>MIR Stage</FormLabel>
                                                                <Select onValueChange={field.onChange} value={field.value}>
                                                                  <FormControl>
                                                                    <SelectTrigger><SelectValue placeholder="Stage" /></SelectTrigger>
                                                                  </FormControl>
                                                                  <SelectContent>
                                                                    <SelectItem value="1" disabled={!mirAllowedStages.includes('1')}>1</SelectItem>
                                                                    <SelectItem value="2" disabled={!mirAllowedStages.includes('2')}>2</SelectItem>
                                                                    <SelectItem value="3" disabled={!mirAllowedStages.includes('3')}>3</SelectItem>
                                                                  </SelectContent>
                                                                </Select>
                                                                <FormMessage /></FormItem>
                                                            )}/>
                                                            <FormField control={form.control} name={`findings.${activeTwinIndex}.mirGrade`} render={({ field }) => (
                                                                <FormItem><FormLabel>MIR Grade (if severe)</FormLabel>
                                                                <Select onValueChange={field.onChange} value={field.value}>
                                                                  <FormControl>
                                                                    <SelectTrigger><SelectValue placeholder="Grade" /></SelectTrigger>
                                                                  </FormControl>
                                                                  <SelectContent><SelectItem value="1">1</SelectItem><SelectItem value="2">2</SelectItem></SelectContent>
                                                                </Select>
                                                                <FormMessage /></FormItem>
                                                            )}/>
                                                            <FormField control={form.control} name={`findings.${activeTwinIndex}.firStage`} render={({ field }) => (
                                                                <FormItem><FormLabel>FIR Stage</FormLabel>
                                                                <Select onValueChange={field.onChange} value={field.value}>
                                                                  <FormControl>
                                                                    <SelectTrigger><SelectValue placeholder="Stage" /></SelectTrigger>
                                                                  </FormControl>
                                                                  <SelectContent>
                                                                    <SelectItem value="1" disabled={!firAllowedStages.includes('1')}>1</SelectItem>
                                                                    <SelectItem value="2" disabled={!firAllowedStages.includes('2')}>2</SelectItem>
                                                                    <SelectItem value="3" disabled={!firAllowedStages.includes('3')}>3</SelectItem>
                                                                  </SelectContent>
                                                                </Select>
                                                                <FormMessage /></FormItem>
                                                            )}/>
                                                            <FormField control={form.control} name={`findings.${activeTwinIndex}.firGrade`} render={({ field }) => (
                                                                <FormItem><FormLabel>FIR Grade (if severe)</FormLabel>
                                                                <Select onValueChange={field.onChange} value={field.value}>
                                                                  <FormControl>
                                                                    <SelectTrigger><SelectValue placeholder="Grade" /></SelectTrigger>
                                                                  </FormControl>
                                                                  <SelectContent><SelectItem value="1">1</SelectItem><SelectItem value="2">2</SelectItem></SelectContent>
                                                                </Select>
                                                                <FormMessage /></FormItem>
                                                            )}/>
                                                        </div>
                                                        <div className="rounded-md border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground space-y-1">
                                                            <p className="font-medium">Staging</p>
                                                            <p>
                                                                MIR stage: <strong>{activeFinding?.mirStage || derivedMirStage}</strong>
                                                                {derivedFirStage ? <> · FIR stage: <strong>{activeFinding?.firStage || derivedFirStage}</strong></> : null}
                                                            </p>
                                                            <p>Stages are kept consistent with your selected findings — conflicting options are disabled and mismatches are auto-corrected.</p>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <FormField control={form.control} name={`findings.${activeTwinIndex}.bacteriaPresent`} render={({ field }) => (
                                                                <FormItem><FormLabel>Bacteria (optional)</FormLabel><FormControl><Input placeholder="e.g., seen on slide" {...field} /></FormControl></FormItem>
                                                            )}/>
                                                            <FormField control={form.control} name={`findings.${activeTwinIndex}.gramStainResults`} render={({ field }) => (
                                                                <FormItem><FormLabel>Gram Stain (optional)</FormLabel><FormControl><Input placeholder="e.g., positive for GPC" {...field} /></FormControl></FormItem>
                                                            )}/>
                                                            <FormField control={form.control} name={`findings.${activeTwinIndex}.gmsResults`} render={({ field }) => (
                                                                <FormItem><FormLabel>GMS Stain (optional)</FormLabel><FormControl><Input placeholder="e.g., negative for fungi" {...field} /></FormControl></FormItem>
                                                            )}/>
                                                        </div>
                                                      </div>
                                                    )}
                                                    {alteration.id === 'villous-infarct' && field.value && (
                                                      <div className="space-y-4 p-2 pt-2 mt-2 border-t">
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <FormField control={form.control} name={`findings.${activeTwinIndex}.infarctSize`} render={({ field }) => (
                                                                <FormItem><FormLabel>Size</FormLabel><FormControl><Input placeholder="e.g., 2.0 cm" {...field} /></FormControl></FormItem>
                                                            )}/>
                                                            <FormField control={form.control} name={`findings.${activeTwinIndex}.infarctExtent`} render={({ field }) => (
                                                                <FormItem><FormLabel>Extent</FormLabel><FormControl><Input placeholder="e.g., <5%" {...field} /></FormControl></FormItem>
                                                            )}/>
                                                        </div>
                                                      </div>
                                                    )}
                                                    {alteration.id === 'retroplacental-hematoma' && field.value && (
                                                      <div className="space-y-2 p-2 pt-2 mt-2 border-t">
                                                          <FormField control={form.control} name={`findings.${activeTwinIndex}.hematomaParenchymalCompression`} render={({ field }) => (
                                                              <FormItem className="flex flex-row items-center space-x-3 space-y-0"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel className="font-normal text-xs">Parenchymal compression</FormLabel></FormItem>
                                                          )}/>
                                                          <FormField control={form.control} name={`findings.${activeTwinIndex}.hematomaOverlyingInfarction`} render={({ field }) => (
                                                              <FormItem className="flex flex-row items-center space-x-3 space-y-0"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel className="font-normal text-xs">Overlying villous infarction</FormLabel></FormItem>
                                                          )}/>
                                                      </div>
                                                    )}
                                                    {alteration.id === 'fetal-vessel-thrombosis' && field.value && (
                                                        <div className="space-y-4 p-2 pt-2 mt-2 border-t">
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <FormField control={form.control} name={`findings.${activeTwinIndex}.thrombusType`} render={({ field }) => (
                                                                    <FormItem><FormLabel>Type</FormLabel>
                                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                                      <FormControl>
                                                                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                                                      </FormControl>
                                                                      <SelectContent><SelectItem value="occlusive">Occlusive</SelectItem><SelectItem value="non-occlusive">Non-occlusive</SelectItem></SelectContent>
                                                                    </Select>
                                                                    </FormItem>
                                                                )}/>
                                                                <FormField control={form.control} name={`findings.${activeTwinIndex}.thrombusLocation`} render={({ field }) => (
                                                                    <FormItem><FormLabel>Location</FormLabel>
                                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                                      <FormControl>
                                                                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                                                      </FormControl>
                                                                      <SelectContent><SelectItem value="chorionic-plate">Chorionic plate</SelectItem><SelectItem value="stem-vessel">Stem vessel</SelectItem></SelectContent>
                                                                    </Select>
                                                                    </FormItem>
                                                                )}/>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {alteration.id === 'intramural-fibrin-deposition' && field.value && (
                                                        <div className="p-2 pt-2 mt-2 border-t">
                                                            <FormField control={form.control} name={`findings.${activeTwinIndex}.intramuralFibrinLocation`} render={({ field }) => (
                                                                <FormItem><FormLabel>Location</FormLabel>
                                                                <Select onValueChange={field.onChange} value={field.value}>
                                                                  <FormControl>
                                                                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                                                  </FormControl>
                                                                  <SelectContent><SelectItem value="chorionic-plate">Chorionic plate</SelectItem><SelectItem value="stem-vessel">Stem vessel</SelectItem></SelectContent>
                                                                </Select>
                                                                </FormItem>
                                                            )}/>
                                                        </div>
                                                    )}
                                                    {(alteration.id === 'avascular-villi' || alteration.id === 'villous-stromal-vascular-karyorrhexis') && field.value && (
                                                        <div className="p-2 pt-2 mt-2 border-t">
                                                            <FormField control={form.control} name={alteration.id === 'avascular-villi' ? `findings.${activeTwinIndex}.avascularVilliSize` : `findings.${activeTwinIndex}.vsvkSize`} render={({ field }) => (
                                                                <FormItem><FormLabel>Focus Size</FormLabel>
                                                                <Select onValueChange={field.onChange} value={field.value}>
                                                                  <FormControl>
                                                                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                                                  </FormControl>
                                                                  <SelectContent><SelectItem value="small">Small</SelectItem><SelectItem value="intermediate">Intermediate</SelectItem><SelectItem value="large">Large</SelectItem></SelectContent>
                                                                </Select>
                                                                </FormItem>
                                                            )}/>
                                                        </div>
                                                    )}
                                                    {alteration.id === 'basal-plate-myometrial-fibers' && field.value && (
                                                      <div className="space-y-4 p-2 pt-2 mt-2 border-t">
                                                        <div className="grid grid-cols-2 gap-4">
                                                          <FormField control={form.control} name={`findings.${activeTwinIndex}.bpmfFocality`} render={({ field }) => (
                                                            <FormItem><FormLabel>Focality</FormLabel>
                                                            <Select onValueChange={field.onChange} value={field.value}>
                                                              <FormControl>
                                                                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                                              </FormControl>
                                                              <SelectContent><SelectItem value="focal">Focal</SelectItem><SelectItem value="multifocal">Multifocal</SelectItem></SelectContent>
                                                            </Select>
                                                            </FormItem>
                                                          )}/>
                                                          <FormField control={form.control} name={`findings.${activeTwinIndex}.bpmfLength`} render={({ field }) => (
                                                            <FormItem>
                                                              <div className="flex items-center gap-1">
                                                                <FormLabel>Longest Length</FormLabel>
                                                                <Tooltip>
                                                                  <TooltipTrigger asChild>
                                                                    <Button type="button" variant="ghost" size="icon" className="h-5 w-5 p-0" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                                                                      <Info className="h-3.5 w-3.5 text-muted-foreground" />
                                                                    </Button>
                                                                  </TooltipTrigger>
                                                                  <TooltipContent>
                                                                    <p className="max-w-xs">Linear dimension along the basal plate in the largest focus of BPMF in mm.</p>
                                                                  </TooltipContent>
                                                                </Tooltip>
                                                              </div>
                                                              <FormControl><Input placeholder="e.g., 5 mm" {...field} /></FormControl>
                                                            </FormItem>
                                                          )}/>
                                                          <FormField control={form.control} name={`findings.${activeTwinIndex}.bpmfStage`} render={({ field }) => (
                                                            <FormItem><FormLabel>Highest Stage</FormLabel>
                                                            <Select onValueChange={field.onChange} value={field.value}>
                                                              <FormControl>
                                                                <SelectTrigger><SelectValue placeholder="Stage" /></SelectTrigger>
                                                              </FormControl>
                                                              <SelectContent><SelectItem value="1">1</SelectItem><SelectItem value="2">2</SelectItem></SelectContent>
                                                            </Select>
                                                            </FormItem>
                                                          )}/>
                                                        </div>
                                                      </div>
                                                    )}
                                                    {alteration.id === 'delayed-villous-maturation' && field.value && (
                                                      <div className="p-2 pt-2 mt-2 border-t">
                                                        <FormField control={form.control} name={`findings.${activeTwinIndex}.dvmFocality`} render={({ field }) => (
                                                          <FormItem><FormLabel>Focality</FormLabel>
                                                          <Select onValueChange={field.onChange} value={field.value}>
                                                            <FormControl>
                                                              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent><SelectItem value="focal">Focal</SelectItem><SelectItem value="diffuse">Diffuse</SelectItem></SelectContent>
                                                          </Select>
                                                          </FormItem>
                                                        )}/>
                                                      </div>
                                                    )}
                                                    {(alteration.id === 'low-grade-chronic-villitis' || alteration.id === 'high-grade-chronic-villitis') && field.value && (
                                                      <div className="p-2 pt-2 mt-2 border-t">
                                                        <FormField control={form.control} name={`findings.${activeTwinIndex}.chronicVillitisExtent`} render={({ field }) => (
                                                          <FormItem><FormLabel>Extent</FormLabel>
                                                          <Select onValueChange={field.onChange} value={field.value}>
                                                            <FormControl>
                                                              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                              {alteration.id === 'low-grade-chronic-villitis' ? (
                                                                <>
                                                                  <SelectItem value="focal">Focal</SelectItem>
                                                                  <SelectItem value="multifocal">Multifocal</SelectItem>
                                                                </>
                                                              ) : (
                                                                <>
                                                                  <SelectItem value="patchy">Patchy</SelectItem>
                                                                  <SelectItem value="diffuse">Diffuse</SelectItem>
                                                                </>
                                                              )}
                                                            </SelectContent>
                                                          </Select>
                                                          </FormItem>
                                                        )}/>
                                                        <div className="pt-2 space-y-1">
                                                          <p className="text-xs font-medium text-muted-foreground">Associated with villitis (when appropriate):</p>
                                                          <FormField control={form.control} name={`findings.${activeTwinIndex}.villitisStemVesselObliteration`} render={({ field }) => (
                                                            <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-2">
                                                              <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                                              <FormLabel className="font-normal text-xs cursor-pointer">Stem vessel obliteration</FormLabel>
                                                            </FormItem>
                                                          )}/>
                                                          <FormField control={form.control} name={`findings.${activeTwinIndex}.villitisAvascularVilli`} render={({ field }) => (
                                                            <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-2">
                                                              <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                                              <FormLabel className="font-normal text-xs cursor-pointer">Avascular villi</FormLabel>
                                                            </FormItem>
                                                          )}/>
                                                          <FormField control={form.control} name={`findings.${activeTwinIndex}.villitisPerivillousFibrin`} render={({ field }) => (
                                                            <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-2">
                                                              <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                                              <FormLabel className="font-normal text-xs cursor-pointer">Perivillous fibrin deposition</FormLabel>
                                                            </FormItem>
                                                          )}/>
                                                        </div>
                                                      </div>
                                                    )}
                                                    {alteration.id === 'pigment-laden-macrophages' && field.value && (
                                                      <div className="space-y-2 p-2 pt-2 mt-2 border-t">
                                                        <FormField control={form.control} name={`findings.${activeTwinIndex}.pigmentMacrophagesMembranes`} render={({ field }) => (
                                                          <FormItem className="flex flex-row items-center space-x-3 space-y-0"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel className="font-normal text-xs">Membranes</FormLabel></FormItem>
                                                        )}/>
                                                        <FormField control={form.control} name={`findings.${activeTwinIndex}.pigmentMacrophagesChorionicPlate`} render={({ field }) => (
                                                          <FormItem className="flex flex-row items-center space-x-3 space-y-0"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel className="font-normal text-xs">Chorionic plate</FormLabel></FormItem>
                                                        )}/>
                                                        <FormField control={form.control} name={`findings.${activeTwinIndex}.pigmentMacrophagesChorionicVesselWalls`} render={({ field }) => (
                                                          <FormItem className="flex flex-row items-center space-x-3 space-y-0"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel className="font-normal text-xs">Chorionic vessel walls</FormLabel></FormItem>
                                                        )}/>
                                                      </div>
                                                    )}
                                              </FormItem>
                                          )}
                                        />
                                      );
                                    })}
                                  </div>
                                </div>
                              )})}
                            </div>
                          </div>
                      </div>
                    </AccordionContent>
                </AccordionItem>
              </Card>

              <Card className="shadow-lg animate-in fade-in-0 zoom-in-95 duration-500 delay-200 overflow-hidden">
                <AccordionItem value="specific-infections" className="border-none">
                    <AccordionTrigger className="p-4 hover:no-underline">
                      <div className="w-full text-left">
                        <CardTitle>Specific Infections (Optional)</CardTitle>
                        <CardDescription>
                            Select any specific infectious agents identified.
                        </CardDescription>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="p-4 pt-0">
                        <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                            {specificInfections.alterations.map((infection) => (
                                <FormField
                                    key={infection.id}
                                    control={form.control}
                                    name={`findings.${activeTwinIndex}.specificInfections.${infection.id}`}
                                    render={({ field }) => (
                                        <FormItem className="rounded-lg border p-0 bg-transparent">
                                          <FormLabel className="flex items-center space-x-3 p-2 font-normal cursor-pointer text-sm h-full">
                                            <FormControl>
                                                <Checkbox
                                                    id={field.name}
                                                    checked={field.value as boolean}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                            <span>
                                              {infection.id === 'cmv' ? 'CMV' : infection.id === 'hsv' ? 'HSV' : infection.id === 'parvovirus' ? 'Parvovirus' : infection.name}
                                            </span>
                                          </FormLabel>
                                        </FormItem>
                                    )}
                                />
                            ))}
                              <FormField
                                control={form.control}
                                name={`findings.${activeTwinIndex}.specificInfections.other`}
                                render={({ field }) => (
                                    <FormItem className="sm:col-span-2 md:col-span-3">
                                    <FormLabel>Other Infection</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., Treponema pallidum" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </AccordionContent>
                  </AccordionItem>
              </Card>
              
              <Card className="shadow-lg animate-in fade-in-0 zoom-in-95 duration-500 delay-250 overflow-hidden">
                <AccordionItem value="additional-findings" className="border-none">
                  <AccordionTrigger className="p-4 hover:no-underline">
                    <div className="w-full text-left">
                      <CardTitle>Additional Microscopic Findings (Optional)</CardTitle>
                      <CardDescription>This text will be incorporated into the microscopic description.</CardDescription>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="p-4 pt-0">
                    <FormField
                      control={form.control}
                      name={`findings.${activeTwinIndex}.additionalMicroscopicFindings`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Textarea
                              placeholder="Enter any additional findings to be incorporated into the AI-generated microscopic description..."
                              className="resize-y"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </AccordionContent>
                </AccordionItem>
              </Card>
            </Accordion>


            <div className="flex justify-center gap-3">
              <Button type="button" variant="outline" size="lg" onClick={() => handleClearAllSelections()} className="shadow-lg">
                Clear All Selections
              </Button>
              <Button type="submit" size="lg" disabled={isPending} className="shadow-lg">
                {isPending ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <Copy className="mr-2 h-5 w-5" />
                )}
                Generate Report
              </Button>
            </div>
            
             {isPending && (
                <div className="w-full flex items-center justify-center bg-background/80 rounded-md z-10 py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            )}
 
            {!isPending && (report || microscopicDescription) && (
              <div className="space-y-6">
                 <Card className="shadow-lg animate-in fade-in-0 zoom-in-95 duration-500">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0">
                          <div className="space-y-1">
                            <CardTitle>Final Diagnosis</CardTitle>
                            <CardDescription>
                                Standardized diagnosis based on your selections.
                            </CardDescription>
                          </div>
                          <div className="w-full max-w-md">
                            <FormField
                              control={form.control}
                              name="reportFormat"
                              render={({ field }) => (
                                <FormItem className="space-y-1">
                                  <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                      <SelectTrigger className="h-9 text-xs">
                                        <SelectValue placeholder="Select format" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="option1_A">A. PLACENTA, DELIVERY AT ... WEEKS (All Caps)</SelectItem>
                                      <SelectItem value="option2">PLACENTA, DELIVERY AT ... WEEKS (No Part Letter)</SelectItem>
                                      <SelectItem value="option3">Placenta, Delivery at ... weeks (Sentence Case)</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <p className="text-[10px] text-muted-foreground text-right pr-1">
                                    change output format
                                  </p>
                                </FormItem>
                              )}
                            />
                          </div>
                      </CardHeader>
                      <CardContent className="relative">
                          <Textarea
                              value={report}
                              onChange={(e) => setReport(e.target.value)}
                              className="min-h-[250px] font-mono text-sm bg-secondary/50"
                              placeholder="Your final diagnosis will be generated here."
                          />
                          <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleCopy(report, 'final')}
                              className="absolute top-4 right-4 z-20"
                              aria-label="Copy report"
                          >
                              <Copy className={`h-4 w-4 ${isCopied ? 'text-green-500' : ''}`} />
                          </Button>
                      </CardContent>
                  </Card>
 
                  <Card className="shadow-lg animate-in fade-in-0 zoom-in-95 duration-500 delay-100">
                      <CardHeader>
                           <CardTitle>
                              Microscopic Description
                          </CardTitle>
                          <CardDescription>
                              A paragraph-style summary of microscopic findings based on standard pathologic terminology.
                          </CardDescription>
                      </CardHeader>
                      <CardContent className="relative">
                          <Textarea
                              value={microscopicDescription}
                              onChange={(e) => setMicroscopicDescription(e.target.value)}
                              className="min-h-[250px] bg-secondary/50 font-mono text-sm"
                              placeholder="The microscopic description will appear here."
                          />
                          <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleCopy(microscopicDescription, 'micro')}
                              className="absolute top-4 right-4 z-20"
                              aria-label="Copy microscopic description"
                          >
                              <Copy className={`h-4 w-4 ${isMicroscopicCopied ? 'text-green-500' : ''}`} />
                          </Button>
                      </CardContent>
                  </Card>
              </div>
            )}

          </form>
        </Form>
      </div>
    </TooltipProvider>
  );
}
