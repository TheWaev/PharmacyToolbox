import {
  type SteroidResult,
  type SteroidKey,
  getSteroid,
  ADRENAL_SUPPRESSION_THRESHOLD_MG,
} from './steroidEquiv';

function fmt(mg: number): string {
  // Round to 1 d.p., trimming trailing zeros (e.g. 1.125 → "1.1", 30 → "30").
  return Number(mg.toFixed(1)).toString();
}

export function buildSteroidSummary(fromKey: SteroidKey, dose: number | null, r: SteroidResult): string {
  if (!r.ok || dose == null) return 'Steroid equivalence — enter a dose.';
  const from = getSteroid(fromKey);
  const lines: string[] = [];
  lines.push('Glucocorticoid dose equivalence');
  lines.push('(Conversion aid only — approximate; mineralocorticoid effect & duration differ. No patient identifiers.)');
  lines.push('');
  lines.push(`From: ${from.name} ${fmt(dose)} mg`);
  lines.push(`Prednisolone-equivalent: ${r.prednisoloneEquivalent != null ? fmt(r.prednisoloneEquivalent) : '?'} mg/day`);
  lines.push('');
  lines.push('Equivalent doses:');
  for (const row of r.rows) {
    lines.push(`  ${row.steroid.name}: ${fmt(row.dose)} mg`);
  }
  if (r.adrenalRisk) {
    lines.push('');
    lines.push(
      `! Prednisolone-equivalent ≥ ${ADRENAL_SUPPRESSION_THRESHOLD_MG} mg/day: if continued ≥3–4 weeks, risk of adrenal suppression — do not stop abruptly, apply sick-day rules and issue an NHS Steroid Emergency Card.`,
    );
  }
  return lines.join('\n');
}
