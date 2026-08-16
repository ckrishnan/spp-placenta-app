# AGENT.md — Placenta Pathfinder (Placental Pathology Reporting App)

> Working document for AI agents and maintainers. Describes the scope, stack, architecture, data flow, and the image-atlas pipeline. Domain reference: **"Standardized Placental Pathology Reporting: Improving Quality and Clinical Utility"** (SPP Placental Pathology Reporting Task Force) — see `docs/Standardized Placental Pathology Reporting Manuscript_agent.txt` and `placenta app instructions.md`.

## 0. Core important instructions for AI agents working on this app

- Be surgical in any edits made - less is more, and fix only what is broken
- If a decision requires more input, ask the user first before making changes
- Keep within the existing tech stack before suggesting code that requires additional new code types
- Verify edits meet the user's requests and check for errors before completing. 

## 1. What this app does (Scope)

Placenta Pathfinder is a single-page **Next.js (App Router) client app** that helps a (typically general) pathologist assemble a **standardized, plain-text placental pathology report** from checkboxes and short inputs. It is a **front-end-only, deterministic template generator** — there is **no AI/LLM call and no backend** involved in report generation. All output is produced locally by `src/lib/report-generator.ts`.

In scope:
- Capture case header: gestational age (weeks + days), placental weight (g), twin status, mode of delivery, completeness of the maternal surface.
- Compute an estimated **placental weight percentile** from Pinar et al. reference tables (singleton + twin) in `src/lib/calculations.ts`.
- Record findings by **anatomical compartment** (Umbilical Cord, Membranes, Placental Villi, Maternal Decidua) plus gross findings, specific infections, and free-text "additional microscopic findings".
- Color-code alterations by **injury pattern** (MVM, FVM, Acute Chorioamnionitis, Acute Abruption, Chronic Inflammatory, DVM, Villous Capillary Lesions, Other).
- Generate two outputs:
  1. **Final Diagnosis** — top-line diagnostic category headers with supporting bullets (disease-based format from the manuscript).
  2. **Microscopic Description** — paragraph-style prose per compartment.
- Include **recommended clinical comments** from the manuscript (abruption, PAS, IUFD, IAI, high-grade villitis, CHI, BPMF, dysmaturity).
- Provide a **Picture Atlas** (reference images) and tooltips with image carousels per finding.
- Support **twins**: separate Twin A / Twin B tabs, chorionicity/amnionicity, per-twin findings and percentiles.
- Allow report header **format** selection (all-caps with part letter, no part letter, sentence case).

Out of scope / not implemented (as of this writing):
- No persistence (Firebase is a dependency but **unused**; `src/app/actions.ts` is an empty `"use server"` stub).
- No actual AI inference; `startTransition`/`isPending` is used only for the loading-spinner UX.
- No auth, no LIS/LIS-HL7 integration, no print/PDF export.
- No triplet support in the UI (percentile code has a `triplet` branch that returns `null`).

## 2. Tech stack

| Area | Choice |
| --- | --- |
| Framework | Next.js 15.1 (App Router), React 19, TypeScript |
| Forms / validation | react-hook-form + `@hookform/resolvers/zod` + Zod schema in `src/lib/schema.ts` |
| UI | shadcn/ui-style components (`src/components/ui/*`), Radix UI primitives, Tailwind CSS 3.4 |
| Icons | lucide-react |
| Images | `next/image` (local `public/images/atlas/**`; no remote image config needed for local files) |
| Carousels / display | embla-carousel-react (shadcn `carousel`) |
| Other notable deps | `firebase`, `dotenv` (unused), `recharts`, `date-fns` (present, not core to the flow) |
| Fonts | Inter (Google Fonts in `src/app/layout.tsx`). *Note:* the `docs/blueprint.md` specifies Belleza/Alegreya; actual config uses Inter for both `body` and `headline` |
| Build | `next.config.ts` — `output: 'standalone'`, `typescript.ignoreBuildErrors: true`, `eslint.ignoreDuringBuilds: true` |

Scripts (`package.json`):
- `npm run dev` — dev server on port 3000
- `npm run build` — production build
- `npm run lint` / `npm run typecheck` (`tsc --noEmit`)

## 3. Project structure (relevant to the flow)

```
src/
  app/
    layout.tsx            # root layout, fonts, Toaster
    page.tsx              # renders <PlacentaPathfinder />
    actions.ts            # empty "use server" stub (unused)
    api/atlas/route.ts    # GET /api/atlas -> { chapters } (folder-driven atlas catalog)
  components/
    placenta-pathfinder.tsx  # MAIN UI: form, compartments, twin tabs, outputs
    atlas-modal.tsx          # Picture Atlas modal (chapters = folders + fullscreen viewer)
    how-to-modal.tsx         # usage guide dialog
    references-modal.tsx     # reference citations dialog
    ui/*                     # shadcn/ui primitives
  lib/
    constants.ts           # compartments, alterations, injuryPatterns, specificInfections
    atlas.ts               # atlasData: "<compartment>:<alteration>" -> image id[] (tooltips)
    atlas-catalog.ts       # server-only: scans public/images/atlas -> chapters
    atlas-types.ts         # AtlasImage / AtlasChapter shared types
    placeholder-images.json # optional manifest (curated labels/hints for atlas + tooltips)
    placeholder-images.ts   # loads manifest -> ImagePlaceholder[]
    schema.ts              # Zod form schema (drives validation + types)
    calculations.ts        # Pinar percentile tables + calculatePercentileRank()
    report-generator.ts    # generateFinalDiagnosis() + generateMicroscopicDescription()
  hooks/use-toast.ts
public/images/atlas/       # each subfolder = a chapter (normal/, gross images/, maternal vascular malperfusion/)
docs/
  blueprint.md                             # original product spec
  Standardized Placental Pathology Reporting Manuscript_agent.txt  # domain source
```

## 4. Core functions and how data flows

### 4.1 Form state (`src/components/placenta-pathfinder.tsx`)
- `useForm<FormValues>` with `zodResolver(formSchema)`, `mode: 'onBlur'`.
- `findings` is an **array of 2** (Twin A/B). `activeTwinIndex` selects which finding the header/compartment checkboxes edit. `isTwin` toggles the twin tabs and validation of the second finding.
- A `watch()` subscription recomputes weight percentiles live and regenerates the Final Diagnosis if a report already exists and format/inputs change.

### 4.2 Domain data model (`src/lib/constants.ts`)
- `injuryPatterns` — 8 patterns (MVM red, FVM green, AC blue, AA yellow, CI orange, DVM purple, VCL pink, OTHER gray) used for the legend, checkbox card tinting, and report grouping. Tailwind classes for these are **safelisted** in `tailwind.config.ts`.
- `compartments` — 4 compartments, each a list of `Alteration`s: `{ id, name, description, patternId, reportingText?, isFvmMicroscopic? }`.
  - `id: 'normal'` is a special per-compartment "normal" entry that mutually excludes other selections in the same compartment.
- `specificInfections` — candida, cmv, hsv, parvovirus (with an `other` free-text handled in schema/UI).
- Alteration `id`s are the canonical keys used by `atlas.ts`, `schema.ts`, and `report-generator.ts`.

### 4.3 Validation (`src/lib/schema.ts`)
- Schemas for each compartment are **generated dynamically** from `constants.ts` alteration ids (`createAlterationSchema`).
- `superRefine` enforces placental weight 50–1500 g for each finding (and always for finding 0).
- GA weeks constrained 18–46.
- **Caveat:** Zod strips unknown keys, so `defaultFindings.specificInfections.actinomyces` (present in the component default, absent from the schema) is silently dropped.

### 4.4 Percentile calculation (`src/lib/calculations.ts`)
- `calculatePercentileRank(weight, weeks, birthType)` → `"<10th" | "10th-25th" | ... | ">90th" | "N/A" | null`.
- Singleton table keyed 21–45 weeks; twin table is **combined** twin weight 19–45 weeks.
- **Caveat:** the twin table holds *combined* weights but the UI enters *per-twin* weights, so Twin A/B percentiles vs. the combined table can be misleading — verify intended behavior.

### 4.5 Report generation (`src/lib/report-generator.ts`)
- `generateFinalDiagnosis(values)`:
  - Header line in the selected format (`A. PLACENTA, DELIVERY AT 38 WEEKS:`, etc.).
  - Twin block: chorionicity / amnionicity.
  - For each finding: weight + percentile line, then findings grouped under **top-line category headers** using `injuryPatterns` (MVM → "Maternal vascular malperfusion lesions", FVM → "Fetal vascular malperfusion lesions [low/high grade]" where high grade is derived from fetal vessel thrombosis / stem vessel obliteration / large avascular villi). Headers print with `--`, supporting elements with tab + `-`; findings with `patternId: null` (e.g., the acute chorioamnionitis block) or `OTHER` are emitted as flat top-level bullets. Meconium-related findings (green staining, pigment-laden macrophages, meconium vasculitis, MAVN) are grouped together under a "Meconium-related findings" header in manuscript order.
  - **Acute chorioamnionitis block**: combines the selected MIR finding (subchorionitis/chorionitis/chorioamnionitis) with any selected FIR findings (chorionic vasculitis, umbilical phlebitis/arteritis, necrotizing funisitis) into one descriptive title with tab-indented MIR/FIR stage+grade lines, e.g. "-- Acute chorionitis [with fetal inflammatory response in chorionic plate vessels]:" + "Maternal inflammatory response, stage 1" + "Fetal inflammatory response, stage 1". An isolated FIR finding without an MIR finding prints as a standalone diagnosis (e.g. "- Acute umbilical phlebitis") rather than an assumed acute chorioamnionitis.
  - Detail interpolation: villous infarct size/extent, hematoma compression/infarction, thrombus type/location, intramural fibrin location, avascular villi / VSVK focus size, BPMF focality/length (labeled "linear length of longest focus (mm)")/stage, DVM focality, chronic villitis extent (extent-first: "Patchy high grade chronic villitis").
  - Gross findings appended; FVM-related gross ids (long cord, hypercoiled, true knot, marginal/velamentous insertion, cord stricture, thin cord, tethered cord) are grouped under FVM **only if** an FVM finding is present.
  - **Comments** appended under `COMMENTS:` when triggered (see §6), separated by blank lines.
  - Footer: Pinar reference citation.
- `generateMicroscopicDescription(values)` — prose per compartment with default "unremarkable" lines when nothing is selected; twin sections prefixed `TWIN A:` / `TWIN B:`.

### 4.6 The image atlas pipeline (pay attention — this is the delicate part)

The Picture Atlas is **folder-driven and auto-generated**. There are two independent subsystems.

**A) Picture Atlas chapters (modal tabs) — automatic from folders:**
- `public/images/atlas/<folder>/<file>` — each **subfolder becomes a chapter** (tab). Files with supported extensions (jpg, jpeg, png, gif, webp, bmp, tif, tiff, avif) are listed automatically. Adding a new folder → new chapter appears; no code changes.
- `src/lib/atlas-catalog.ts` (server-only) — scans the folder tree with `fs`, merges curated metadata from the manifest (matched by `imageUrl`), and returns `AtlasChapter[]` (`{ folder, title, images }`). Filenames are slugified into unique ids (deduped so `uc hypercoiled 2.jpg` ≠ `uc hypercoiled-2.jpg`) and title-cased into labels when no curated entry exists. Chapters are ordered via the curated `CHAPTER_ORDER` map (Normal → Gross → Acute Chorio → Chronic Inflammatory → MVM → FVM → Abruption → Villous/Perivillous → BPMF → Infections → Miscellaneous); unknown folders sort alphabetically after.
- `src/app/api/atlas/route.ts` — `GET /api/atlas` returns `{ chapters }`; `export const dynamic = "force-dynamic"` so new folders are always picked up.
- `src/components/atlas-modal.tsx` — fetches `/api/atlas` on every open (so new folders/images appear immediately), renders a `Tabs` list with one tab per chapter (`Title (count)`), a card grid per chapter, and a fullscreen viewer with prev/next navigation scoped to the current chapter.
- Shared types in `src/lib/atlas-types.ts` (`AtlasImage`, `AtlasChapter`) — safe to import from both client and server.

**B) Per-finding tooltips — manifest + atlasData (curated, lesion-linked):**
- `src/lib/placeholder-images.json` `placeholderImages[]` is the **optional** manifest: `id`, `imageUrl` (must match disk path exactly), `imageHint` (emitted as `data-ai-hint`), `description`. It overrides the auto-generated label and enables tooltip linking.
- `src/lib/atlas.ts` `atlasData: Record<string, string[]>` maps `"<compartmentId>:<alterationId>"` → manifest **ids**. `placenta-pathfinder.tsx` builds `imageMap` from `PlaceHolderImages` and shows a shadcn `Carousel` in the info popover for each lesion's linked images (falling back to an inline amber reminder for `massive-perivillous-fibrin` / `maternal-floor-infarct` when no images are linked).

**Hard rules / failure modes to respect:**
- The atlas modal chapters do **not** depend on the manifest — images on disk always appear. Manifest registration only overrides labels and enables tooltip linkage.
- Tooltip lookups are **by id only**; an id in `atlasData` missing from the manifest is silently skipped.
- Supported image extensions are whitelisted in `atlas-catalog.ts` — adding a new extension requires editing that set.
- `data-ai-hint`/`imageHint` is metadata only — there is no code that performs an image search.
- `atlas-catalog.ts` uses `process.cwd()` + `public/images/atlas`, which works in dev and in `standalone` production output.

**To add a new chapter:** create `public/images/atlas/<new-folder>/` and drop image files in — done.
**To curate labels/hints or link to tooltips:** also add a manifest entry in `placeholder-images.json` (matched by `imageUrl`) and optionally add its `id` to `atlasData["<compartment>:<alteration>"]`.

## 5. Reporting-guideline mapping (from the SPP manuscript)

The app follows the manuscript's **disease-based, table-style template** with a "top-line" diagnostic header and supporting findings. Header elements (manuscript §Header) map to: GA, weight, percentile, completeness of maternal surface, mode of delivery. Significant gross findings map to the Gross Findings card. Categories from manuscript Table 1 and how the app handles them:

| Manuscript category | App representation |
| --- | --- |
| Acute chorioamnionitis (staging/grading) | MIR findings + FIR findings combined into one descriptive block (e.g. "-- Acute chorionitis [with fetal inflammatory response in chorionic plate vessels]:" with MIR/FIR stage+grade lines); MIR stage/grade + FIR stage/grade selects; optional bacteria/Gram/GMS. Isolated FIR without MIR prints as a standalone diagnosis. No-IAI comment via `clinicalIAI`. |
| Chronic inflammatory lesions | `CI` pattern (chronic villitis low/high grade, basal villitis, chronic chorioamnionitis, deciduitis, Eo/T-cell vasculitis, histiocytic hyperplasia). High-grade villitis comment auto-added. |
| MVM | `MVM` header; accelerated maturation, distal villous hypoplasia, agglutination, infarct (±size/extent), infarction hematoma, decidual arteriopathy subtypes. |
| FVM | `FVM` header w/ low/high grade derivation; thrombus, intramural fibrin, avascular villi, VSVK, stem vessel obliteration; gross cord "at-risk" lesions grouped under FVM when FVM present. |
| Acute abruption | `AA` requires ≥2 supporting features (retroplacental hematoma, intravillous hemorrhage) to form the hedged header "Findings suggesting acute placental abruption" (+ " [clinical history of abruption]" when `clinicalAbruption`); a single isolated feature prints standalone. `clinicalAbruption` "no evidence" comment only when no abruption findings selected. |
| Chronic marginal abruption ("2 of 3") | Gross checkbox `circumvallateMembraneInsertion` + `remote-marginal-hematoma` + `chorioamniotic-hemosiderosis`; **no "2 of 3" logic is enforced** — noted as a gap. |
| BPMF / PAS | `maternalDecidua` alterations + BPMF focality/stage/length (length emitted as "linear length of longest focus (mm): …"); the BPMF info box defines stages 1/2 (Hecht et al. 2020) and the Longest Length field has an info tooltip; PAS comment; BPMF reference comment. |
| Increased fetal NRBCs | alteration with the ≥1 NRBC/40x definition in its description. |
| Intervillous thrombus | standalone `OTHER` bullet. |
| Patchy / diffuse villous edema | `OTHER` bullets. |
| Meconium | gross `greenStaining` + pigment/vasculitis/MAVN alterations grouped together under a "Meconium-related findings" header in the manuscript order. `clinicalMSF` gates the ", consistent with meconium" wording on pigment-laden macrophages and mild vasculitis lines. MAVN comment auto-added. |
| Villous capillary lesions (chorangiosis rule of 10s, chorangiomatosis, chorangioma) | `VCL` pattern. |
| Perivillous fibrin (Katzman–Genest) / MPVFD / MFI | `OTHER` bullets; inline UI reminder; **MPVFD/MFI recurrence comment auto-added**. |
| Chronic histiocytic intervillositis | `CI` alteration + auto comment. |
| DVM / villous dysmaturity | `DVM` pattern; focality select. DVM prints as a single line "-- Delayed villous maturation [focal/diffuse]" (no redundant header+item); dysmaturity separate line + comment. |
| IUFD | `clinicalIUFD` comment ("cause of demise could not be established"). |
| Specific infections / sickled RBCs | specific-infections card + sickled RBCs bullet. |
| Twins | Twin A/B tabs, chorionicity/amnionicity, per-twin findings. |
| Normal | "Mark All as Normal" button; per-compartment `normal` flag; "No significant … findings" fallback line. |

## 6. Known gaps & maintenance notes (observed during review)

- **Atlas chapters are folder-driven and auto-populated** (normal, gross images, maternal vascular malperfusion); most images are shown with filename-derived labels — only images registered in the manifest get curated labels, and most lesions still have no tooltip-linked images.
- **No "2 of 3" chronic-marginal-abruption rule** enforcement (manuscript requires 2 of 3 findings to use the header).
- **CHI recurrence % mismatch:** app comment says "up to 50%"; `placenta app instructions.md` Table 1 says "up to 80%" — verify against source and align.
- **`isFvmMicroscopic` flag** is defined on FVM alterations but never consumed by `report-generator.ts`.
- **`constants.ts`** builds an `imageMap` and imports `PlaceHolderImages` that are unused (dead code; remove or wire in).
- **`specificInfections.actinomyces`** in `defaultFindings` is dropped by Zod (not in schema).
- **Twin percentiles** are computed against the *combined* twin weight table while the UI asks for per-twin weights — confirm intended.
- **"AI-powered" is cosmetic:** report generation is fully local/templated; the loading spinner is a `useTransition` simulation. Firebase/dotenv are unused; `actions.ts` is an empty server-action stub.
- `next.config.ts` disables type/ESLint errors during build (`ignoreBuildErrors`, `ignoreDuringBuilds`) — CI should run `npm run typecheck` / `npm run lint` separately.

## 7. Conventions

- Alteration `id`s are kebab-case and used as the single source of truth across `constants.ts`, `schema.ts`, `atlas.ts`, and `report-generator.ts` — keep them in sync.
- Compartment ids: `umbilicalCord`, `membranes`, `placentalVilli`, `maternalDecidua` (atlas keys and modal grouping rely on `"<compartmentId>:<alterationId>"`).
- Add any new injury-pattern background classes to the Tailwind **safelist** (`tailwind.config.ts`) or the colors won't survive the build.
- New recommended comments belong in `generateFinalDiagnosis` under the `COMMENTS:` block, gated on the same selections that trigger the UI (e.g., `high-grade-chronic-villitis`, `eosinophilic-t-cell-vasculitis`, `chronic-histiocytic-intervillositis`, `basal-plate-myometrial-fibers`, `villous-dysmaturity`, `meconium-associated-vascular-necrosis`, `massive-perivillous-fibrin`/`maternal-floor-infarct`, `clinical*` flags).
- Report output style (per the manuscript style guide): **main injury-pattern headers use `--`** (e.g., `-- Maternal vascular malperfusion lesions:`), **supporting elements are tab + single dash** (`\t- ...`), standalone/OTHER diagnoses use a single dash (`- ...`), and **multiple comments are separated by a blank line**. Chronic villitis is emitted extent-first ("Patchy high grade chronic villitis").
- Preserve the manuscript's exact diagnostic verbiage when extending `reportingText` / comment strings; prefer the manuscript over paraphrase.

