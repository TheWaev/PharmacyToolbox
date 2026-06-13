import { type SwitchResult, STRATEGY_LABEL, CLASS_LABEL } from './switching';

const SEVERITY_MARK: Record<string, string> = { danger: '!!', warning: '!', info: '-' };

export function buildSwitchSummary(r: SwitchResult): string {
  const lines: string[] = [];
  lines.push('Antidepressant switching');
  lines.push('(Decision-support guide only — no patient identifiers. Verify against the SmPC.)');
  lines.push('');
  lines.push(`From: ${r.from.name} (${CLASS_LABEL[r.from.class]})`);
  lines.push(`To:   ${r.to.name} (${CLASS_LABEL[r.to.class]})`);
  lines.push('');

  if (r.sameDrug) {
    lines.push(r.detail);
    return lines.join('\n');
  }

  lines.push(`Strategy: ${STRATEGY_LABEL[r.strategy]}`);
  if (r.washout) {
    lines.push(`Washout: ${r.washout.label} (${r.washout.reason})`);
  }
  lines.push('');
  lines.push(`How: ${r.detail}`);

  if (r.cautions.length > 0) {
    lines.push('');
    lines.push('Cautions:');
    for (const c of r.cautions) {
      lines.push(`  ${SEVERITY_MARK[c.severity] ?? '-'} ${c.text}`);
    }
  }

  if (r.specialistAdvised) {
    lines.push('');
    lines.push('** Specialist (psychiatric) supervision advised for this switch. **');
  }
  return lines.join('\n');
}
