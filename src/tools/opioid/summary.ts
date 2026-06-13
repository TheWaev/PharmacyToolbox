import { totalOme, convertOmeTo, OPIOIDS, type OmeItem } from './opioidConvert';

const label = (key: string) => OPIOIDS.find((o) => o.key === key)?.label ?? key;
const round = (n: number) => Math.round(n * 10) / 10;

export function buildOpioidSummary(items: OmeItem[], targetKey: string | null): string {
  const r = totalOme(items);
  const lines: string[] = [];
  lines.push('Opioid conversion — oral morphine equivalent (OME)');
  lines.push('(Decision aid only. Reduce 25–50% for cross-tolerance when switching. No identifiers.)');
  lines.push('');
  lines.push('Current opioids (dose × factor = OME):');
  for (const c of r.contributions) {
    lines.push(`- ${c.label}: ${round(c.dose)} ${c.unit} × ${c.factor} = ${round(c.ome)} mg OME`);
  }
  lines.push('');
  lines.push(`Total oral morphine equivalent: ~${round(r.totalOme)} mg/24h`);
  if (r.highDose) lines.push('! ≥120 mg OME/day — seek specialist advice (harm may outweigh benefit).');

  if (targetKey) {
    const c = convertOmeTo(r.totalOme, targetKey);
    if (c) {
      lines.push('');
      lines.push(`Switch to ${label(targetKey)}:`);
      lines.push(`  Method: ${round(r.totalOme)} mg OME / ${c.factor} = ${round(c.equivalent)} ${c.unit} (equianalgesic)`);
      lines.push(`  Start ~${round(c.reducedLow)}–${round(c.reducedHigh)} ${c.unit} after 25–50% reduction, then titrate.`);
    }
  }
  return lines.join('\n');
}
