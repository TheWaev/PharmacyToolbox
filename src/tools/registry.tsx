import type { ComponentType } from 'react';
import type { Icon } from '@phosphor-icons/react';
import RepeatSync from './repeat-sync/RepeatSync';
import CrCl from './crcl/CrCl';
import WeightMgmt from './weight-management/WeightMgmt';
import AfRisk from './af-risk/AfRisk';
import AcbCalc from './acb/AcbCalc';
import OpioidConvert from './opioid/OpioidConvert';
import DoacChecker from './doac/DoacChecker';
import CkdClassifier from './ckd/CkdClassifier';
import Qrisk3 from './qrisk3/Qrisk3';
import SteroidEquiv from './steroid/SteroidEquiv';
import AntidepressantSwitch from './antidepressant-switch/AntidepressantSwitch';
import {
  CalculatorIcon,
  HeartPulseIcon,
  ScalesIcon,
  PulseIcon,
  BrainIcon,
  ConvertIcon,
  DropIcon,
  FunnelIcon,
  HeartIcon,
  PillIcon,
  SwitchIcon,
} from '../components/icons';

/**
 * The single source of truth for the suite's tools.
 *
 * To add a future tool (e.g. CrCl): create a self-contained folder under
 * `src/tools/`, then add one entry here. The home page and the router both
 * read from this list, so no other file needs editing.
 */
/** Home-page groupings ("toolbox drawers"), in display order. */
export const TOOL_CATEGORIES = [
  'Dosing & conversions',
  'Risk & assessment',
  'Medicines management',
] as const;
export type ToolCategory = (typeof TOOL_CATEGORIES)[number];

export interface ToolDef {
  /** URL slug, e.g. "repeat-sync" -> /#/tools/repeat-sync */
  slug: string;
  name: string;
  /** Full description (used on the tool page / search). */
  summary: string;
  /** Short scannable label for the home tile. Falls back to `summary`. */
  tagline?: string;
  /** Toolbox drawer this tool belongs to on the home page. */
  category?: ToolCategory;
  status: 'available' | 'planned';
  /** Marks the tool as beta (pending clinical validation). Remove once signed off. */
  beta?: boolean;
  /** Icon shown on the home page card. */
  icon: Icon;
  /** Rendered at the tool's route. Omit for `planned` tools. */
  component?: ComponentType;
}

export const tools: ToolDef[] = [
  {
    slug: 'repeat-sync',
    name: 'Repeat Medication Synchronisation',
    tagline: 'Align repeats to one run-out date',
    category: 'Medicines management',
    summary:
      'Align a patient’s repeat medications onto a common run-out date and calculate the one-off bridging quantity per item.',
    status: 'available',
    icon: CalculatorIcon,
    component: RepeatSync,
  },
  {
    slug: 'crcl',
    name: 'Creatinine Clearance (CrCl)',
    tagline: 'Cockcroft–Gault renal estimate',
    category: 'Dosing & conversions',
    summary:
      'Estimate creatinine clearance (Cockcroft–Gault) for renal dose adjustment, with actual / ideal / adjusted body weight.',
    status: 'available',
    icon: HeartPulseIcon,
    component: CrCl,
  },
  {
    slug: 'weight-management',
    name: 'Weight Management Eligibility',
    tagline: 'Tirzepatide eligibility (SEL pathway)',
    category: 'Medicines management',
    summary:
      'Check eligibility for NHS tirzepatide (Mounjaro) weight management against the South East London pathway.',
    status: 'available',
    icon: ScalesIcon,
    component: WeightMgmt,
  },
  {
    slug: 'af-risk',
    name: 'Atrial Fibrillation Risk',
    tagline: 'CHA₂DS₂-VASc + ORBIT',
    category: 'Risk & assessment',
    summary:
      'CHA₂DS₂-VASc stroke risk and ORBIT bleeding risk (NICE NG196) to support anticoagulation decisions.',
    status: 'available',
    icon: PulseIcon,
    component: AfRisk,
  },
  {
    slug: 'acb',
    name: 'Anticholinergic Burden (ACB)',
    tagline: 'Anticholinergic burden score',
    category: 'Medicines management',
    summary:
      'Total a patient’s anticholinergic cognitive burden from their medicines (ACB scale); flags a score ≥3.',
    status: 'available',
    icon: BrainIcon,
    component: AcbCalc,
  },
  {
    slug: 'opioid-converter',
    name: 'Opioid Dose Converter',
    tagline: 'Oral morphine equivalent + switching',
    category: 'Dosing & conversions',
    summary:
      'Approximate oral morphine equivalent (OME) and opioid switching guide, with cross-tolerance and safety caveats.',
    status: 'available',
    beta: true,
    icon: ConvertIcon,
    component: OpioidConvert,
  },
  {
    slug: 'doac-dosing',
    name: 'DOAC Dose Checker',
    tagline: 'DOAC dose & reduction (AF)',
    category: 'Dosing & conversions',
    summary:
      'Licensed dose and reduction criteria for apixaban, rivaroxaban, edoxaban and dabigatran in non-valvular AF.',
    status: 'available',
    beta: true,
    icon: DropIcon,
    component: DoacChecker,
  },
  {
    slug: 'ckd',
    name: 'CKD Classification (KDIGO)',
    tagline: 'eGFR/ACR staging + referral',
    category: 'Risk & assessment',
    summary:
      'Classify CKD by eGFR and ACR on the KDIGO heat-map and check NICE NG203 nephrology referral criteria.',
    status: 'available',
    icon: FunnelIcon,
    component: CkdClassifier,
  },
  {
    slug: 'qrisk3',
    name: 'QRISK3 — CVD Risk',
    tagline: '10-year cardiovascular risk',
    category: 'Risk & assessment',
    summary:
      'Estimate 10-year cardiovascular risk (QRISK®3-2017) for primary prevention — runs locally, no postcode.',
    status: 'available',
    beta: true,
    icon: HeartIcon,
    component: Qrisk3,
  },
  {
    slug: 'steroid-equivalence',
    name: 'Corticosteroid Equivalence',
    tagline: 'Glucocorticoid dose conversion',
    category: 'Dosing & conversions',
    summary:
      'Convert between glucocorticoids by equivalent anti-inflammatory dose, with adrenal-suppression prompts.',
    status: 'available',
    beta: true,
    icon: PillIcon,
    component: SteroidEquiv,
  },
  {
    slug: 'antidepressant-switch',
    name: 'Antidepressant Switching',
    tagline: 'Switching strategy & washouts',
    category: 'Dosing & conversions',
    summary:
      'Recommended method (direct / cross-taper / washout), washout interval and key cautions for switching between antidepressants — SSRIs, SNRIs, TCAs, MAOIs and newer agents.',
    status: 'available',
    beta: true,
    icon: SwitchIcon,
    component: AntidepressantSwitch,
  },
];

export const availableTools = tools.filter(
  (t): t is ToolDef & { component: ComponentType } =>
    t.status === 'available' && typeof t.component !== 'undefined',
);

export function findTool(slug: string): ToolDef | undefined {
  return tools.find((t) => t.slug === slug);
}
