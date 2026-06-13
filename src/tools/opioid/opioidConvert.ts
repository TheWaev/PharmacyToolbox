/**
 * Opioid → oral morphine equivalent (OME) conversion. Pure + testable.
 *
 * ⚠️ DECISION AID ONLY. Conversion ratios are approximate and vary between
 * sources; equianalgesic switching should reduce the calculated dose by 25–50%
 * for incomplete cross-tolerance. Patches and methadone must not be initiated or
 * rotated from these figures alone — use product-specific tables / specialist
 * advice. Ratios follow the BNF "Prescribing in palliative care" equivalence
 * tables (based on the Palliative Care Formulary, 9th ed); the 25–50% reduction
 * on switching follows Royal College of Anaesthetists guidance cited there.
 */

export type DoseUnit = 'mg/day' | 'mcg/h';

export interface Opioid {
  key: string;
  label: string;
  unit: DoseUnit;
  /** mg of oral morphine per unit of dose. */
  omeFactor: number;
  note?: string;
}

export const OPIOIDS: Opioid[] = [
  { key: 'morphine_oral', label: 'Morphine (oral)', unit: 'mg/day', omeFactor: 1 },
  { key: 'codeine', label: 'Codeine (oral)', unit: 'mg/day', omeFactor: 0.1 },
  { key: 'dihydrocodeine', label: 'Dihydrocodeine (oral)', unit: 'mg/day', omeFactor: 0.1 },
  { key: 'tramadol', label: 'Tramadol (oral)', unit: 'mg/day', omeFactor: 0.1 },
  { key: 'oxycodone_oral', label: 'Oxycodone (oral)', unit: 'mg/day', omeFactor: 1.5 },
  { key: 'hydromorphone_oral', label: 'Hydromorphone (oral)', unit: 'mg/day', omeFactor: 5 },
  { key: 'morphine_sc', label: 'Morphine (SC/IV)', unit: 'mg/day', omeFactor: 2 },
  { key: 'diamorphine_sc', label: 'Diamorphine (SC)', unit: 'mg/day', omeFactor: 3 },
  {
    key: 'fentanyl_patch',
    label: 'Fentanyl patch',
    unit: 'mcg/h',
    omeFactor: 2.4,
    note: 'BNF/PCF9 approximate equivalence: 25 micrograms/h ≈ 60 mg/24h oral morphine (≈2.4 per microgram/hour). Use product-specific tables to initiate or rotate.',
  },
  {
    key: 'buprenorphine_patch',
    label: 'Buprenorphine patch',
    unit: 'mcg/h',
    omeFactor: 2.4,
    note: 'BNF/PCF9 approximate equivalence: 5 micrograms/h ≈ 12 mg/24h oral morphine (≈2.4 per microgram/hour, linear to 70 micrograms/h). Prescribe patches by brand, dose & duration (7-/4-/3-day formulations differ).',
  },
];

const byKey = new Map(OPIOIDS.map((o) => [o.key, o]));

/** NICE: doses above 120 mg OME/day warrant specialist review (harm > benefit). */
export const HIGH_DOSE_OME = 120;

export interface OmeItem {
  key: string;
  dose: number | null;
}

/** A single opioid's contribution to the OME total, with the working shown. */
export interface OmeContribution {
  key: string;
  label: string;
  dose: number;
  unit: DoseUnit;
  /** mg oral morphine per unit of this opioid's dose. */
  factor: number;
  /** dose × factor. */
  ome: number;
}

export interface OmeResult {
  totalOme: number; // mg oral morphine / 24h
  highDose: boolean;
  contributions: OmeContribution[];
}

export function totalOme(items: OmeItem[]): OmeResult {
  const contributions: OmeContribution[] = [];
  let totalOme = 0;
  for (const it of items) {
    const o = byKey.get(it.key);
    if (!o || it.dose == null || !(it.dose > 0)) continue;
    const ome = it.dose * o.omeFactor;
    totalOme += ome;
    contributions.push({
      key: o.key,
      label: o.label,
      dose: it.dose,
      unit: o.unit,
      factor: o.omeFactor,
      ome,
    });
  }
  return { totalOme, highDose: totalOme >= HIGH_DOSE_OME, contributions };
}

export interface TargetConversion {
  /** Equivalent dose of the target opioid (in its own unit) before any reduction. */
  equivalent: number;
  /** Recommended starting range after a 25–50% cross-tolerance reduction. */
  reducedLow: number; // 50% reduction
  reducedHigh: number; // 25% reduction
  unit: DoseUnit;
  /** mg oral morphine per unit of the target — the divisor used (for showing the working). */
  factor: number;
}

/** Convert a total OME to a target opioid's dose (with cross-tolerance range). */
export function convertOmeTo(totalOmeMg: number, targetKey: string): TargetConversion | null {
  const o = byKey.get(targetKey);
  if (!o || o.omeFactor <= 0) return null;
  const equivalent = totalOmeMg / o.omeFactor;
  return {
    equivalent,
    reducedLow: equivalent * 0.5,
    reducedHigh: equivalent * 0.75,
    unit: o.unit,
    factor: o.omeFactor,
  };
}
