import { describe, it, expect } from 'vitest';
import { scoreAcb, searchAcb, ACB_DRUGS } from './acbScale';

describe('ACB scale', () => {
  it('every drug has a valid score (1–3) and unique name', () => {
    const names = new Set<string>();
    for (const d of ACB_DRUGS) {
      expect([1, 2, 3]).toContain(d.score);
      expect(names.has(d.name)).toBe(false);
      names.add(d.name);
    }
    expect(ACB_DRUGS.length).toBeGreaterThan(80);
  });

  it('sums the selected drugs and counts definite anticholinergics', () => {
    // Amitriptyline 3 + Oxybutynin 3 + Codeine 1 = 7; two definite (score ≥2)
    const r = scoreAcb(['Amitriptyline', 'Oxybutynin', 'Codeine']);
    expect(r.total).toBe(7);
    expect(r.definiteCount).toBe(2);
    expect(r.significant).toBe(true);
  });

  it('flags significant at total ≥ 3', () => {
    expect(scoreAcb(['Codeine', 'Digoxin']).significant).toBe(false); // 1 + 1 = 2
    expect(scoreAcb(['Codeine', 'Amitriptyline']).significant).toBe(true); // 1 + 3 = 4
  });

  it('ignores unknown names', () => {
    expect(scoreAcb(['Not A Drug', 'Codeine']).total).toBe(1);
  });

  it('searches by name and UK/US alias', () => {
    expect(searchAcb('oxybut').some((d) => d.name === 'Oxybutynin')).toBe(true);
    // UK name primary, US alias matches
    expect(searchAcb('chlorpheniramine').some((d) => d.name === 'Chlorphenamine')).toBe(true);
    expect(searchAcb('meperidine').some((d) => d.name === 'Pethidine')).toBe(true);
    expect(searchAcb('scopolamine').some((d) => d.name === 'Hyoscine hydrobromide')).toBe(true);
  });
});
