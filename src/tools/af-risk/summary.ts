import type { ChadsVascResult, HasBledResult } from './riskScores';

export function buildAfSummary(cv: ChadsVascResult, hb: HasBledResult): string {
  const lines: string[] = [];
  lines.push('Atrial fibrillation risk assessment');
  lines.push('(Decision aid only — clinical judgement required. No patient identifiers.)');
  lines.push('');
  lines.push(`CHA₂DS₂-VASc: ${cv.score}`);
  lines.push(`  ${cv.recommendation}`);
  for (const it of cv.items.filter((i) => i.points > 0)) lines.push(`  + ${it.label} (${it.points})`);
  lines.push('');
  lines.push(`HAS-BLED: ${hb.score}`);
  lines.push(`  ${hb.recommendation}`);
  for (const it of hb.items.filter((i) => i.points > 0)) lines.push(`  + ${it.label} (${it.points})`);
  return lines.join('\n');
}
