import { scoreAcb } from './acbScale';

export function buildAcbSummary(selectedNames: string[]): string {
  const r = scoreAcb(selectedNames);
  const lines: string[] = [];
  lines.push('Anticholinergic Burden (ACB) assessment');
  lines.push('(Decision aid only — clinical review required. No patient identifiers.)');
  lines.push('');
  lines.push(`Total ACB score: ${r.total}`);
  lines.push(`Definite anticholinergics (score ≥2): ${r.definiteCount}`);
  lines.push(
    r.significant
      ? 'ACB ≥3 — clinically significant; consider reviewing/deprescribing anticholinergics.'
      : 'Below the clinically significant threshold (ACB 3).',
  );
  lines.push('');
  lines.push('Medicines:');
  for (const d of r.selected) lines.push(`- ${d.name} (${d.score})`);
  return lines.join('\n');
}
