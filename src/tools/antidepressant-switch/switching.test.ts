import { describe, it, expect } from 'vitest';
import {
  evaluateSwitch,
  ANTIDEPRESSANTS,
  getDrug,
  MAOI_STOP_WASHOUT_DAYS,
} from './switching';

const hasDanger = (cautions: { severity: string }[]) => cautions.some((c) => c.severity === 'danger');

describe('antidepressant switching — MAOI pathway (washouts)', () => {
  it('starting an MAOI from fluoxetine needs a 5–6 week washout', () => {
    const r = evaluateSwitch('fluoxetine', 'phenelzine');
    expect(r.strategy).toBe('washout');
    expect(r.washout?.days).toBe(35);
    expect(r.washout?.label).toMatch(/5 to 6 weeks/);
    expect(r.specialistAdvised).toBe(true);
    expect(hasDanger(r.cautions)).toBe(true);
  });

  it('starting an MAOI from paroxetine or sertraline needs 2 weeks', () => {
    expect(evaluateSwitch('paroxetine', 'tranylcypromine').washout?.days).toBe(14);
    expect(evaluateSwitch('sertraline', 'phenelzine').washout?.days).toBe(14);
  });

  it('starting an MAOI from most SSRIs/SNRIs needs 1 week', () => {
    expect(evaluateSwitch('citalopram', 'phenelzine').washout?.days).toBe(7);
    expect(evaluateSwitch('venlafaxine', 'phenelzine').washout?.days).toBe(7);
  });

  it('starting an MAOI from clomipramine or imipramine needs 3 weeks', () => {
    expect(evaluateSwitch('clomipramine', 'phenelzine').washout?.days).toBe(21);
    expect(evaluateSwitch('imipramine', 'isocarboxazid').washout?.days).toBe(21);
  });

  it('stopping an irreversible MAOI needs a 2-week washout before any drug', () => {
    const r = evaluateSwitch('phenelzine', 'sertraline');
    expect(r.strategy).toBe('washout');
    expect(r.washout?.days).toBe(MAOI_STOP_WASHOUT_DAYS);
    expect(r.washout?.days).toBe(14);
    expect(r.specialistAdvised).toBe(true);
  });

  it('MAOI → MAOI uses the 2-week stop washout', () => {
    expect(evaluateSwitch('phenelzine', 'tranylcypromine').washout?.days).toBe(14);
  });

  it('stopping moclobemide (reversible) only needs ~24 hours', () => {
    const r = evaluateSwitch('moclobemide', 'sertraline');
    expect(r.strategy).toBe('washout');
    expect(r.washout?.days).toBe(1);
    expect(r.washout?.label).toMatch(/24 hours/);
  });

  it('starting moclobemide is governed by the persistence of the drug being stopped', () => {
    // fluoxetine still persists, so a long washout applies even before a RIMA
    expect(evaluateSwitch('fluoxetine', 'moclobemide').washout?.days).toBe(35);
    expect(evaluateSwitch('citalopram', 'moclobemide').washout?.days).toBe(7);
  });

  it('every switch involving an MAOI/RIMA flags danger and specialist advice', () => {
    const maois = ANTIDEPRESSANTS.filter((d) => d.class === 'MAOI' || d.class === 'RIMA');
    const others = ANTIDEPRESSANTS.filter((d) => d.class !== 'MAOI' && d.class !== 'RIMA');
    for (const m of maois) {
      for (const o of others) {
        const a = evaluateSwitch(o.id, m.id);
        const b = evaluateSwitch(m.id, o.id);
        expect(a.specialistAdvised && b.specialistAdvised).toBe(true);
        expect(hasDanger(a.cautions) && hasDanger(b.cautions)).toBe(true);
        expect(a.strategy === 'washout' && b.strategy === 'washout').toBe(true);
      }
    }
  });
});

describe('antidepressant switching — non-MAOI pathway', () => {
  it('switching FROM fluoxetine is stop-and-start-low, not a cross-taper', () => {
    const r = evaluateSwitch('fluoxetine', 'sertraline');
    expect(r.strategy).toBe('taper-then-start');
    expect(r.washout).toBeNull();
    expect(r.detail.toLowerCase()).toContain('low dose');
    expect(r.cautions.some((c) => /persist/i.test(c.text))).toBe(true);
  });

  it('a routine SSRI → SSRI switch is a cautious cross-taper', () => {
    const r = evaluateSwitch('citalopram', 'sertraline');
    expect(r.strategy).toBe('cross-taper');
    expect(r.washout).toBeNull();
    expect(r.specialistAdvised).toBe(false);
  });

  it('two serotonergic drugs raise a serotonin-toxicity caution', () => {
    const r = evaluateSwitch('sertraline', 'venlafaxine');
    expect(r.cautions.some((c) => /serotonin/i.test(c.text))).toBe(true);
  });

  it('a TCA with a CYP2D6 inhibitor warns about raised TCA levels', () => {
    const r = evaluateSwitch('fluoxetine', 'amitriptyline'); // fluoxetine = strong 2D6 inhibitor
    expect(r.cautions.some((c) => /CYP2D6/i.test(c.text))).toBe(true);
    // and the reverse direction (continuing TCA, introducing inhibitor)
    const r2 = evaluateSwitch('nortriptyline', 'paroxetine');
    expect(r2.cautions.some((c) => /CYP2D6/i.test(c.text))).toBe(true);
  });

  it('clomipramine switches recommend specialist advice', () => {
    expect(evaluateSwitch('sertraline', 'clomipramine').specialistAdvised).toBe(true);
  });

  it('a short-half-life drug (paroxetine/venlafaxine) warns to taper for discontinuation', () => {
    expect(
      evaluateSwitch('paroxetine', 'sertraline').cautions.some((c) => /discontinuation/i.test(c.text)),
    ).toBe(true);
    expect(
      evaluateSwitch('venlafaxine', 'mirtazapine').cautions.some((c) =>
        /discontinuation/i.test(c.text),
      ),
    ).toBe(true);
  });

  it('switching to agomelatine notes LFT monitoring', () => {
    expect(
      evaluateSwitch('sertraline', 'agomelatine').cautions.some((c) => /LFT/i.test(c.text)),
    ).toBe(true);
  });

  it('no MAOI switch is ever flagged as needing specialist input by default', () => {
    // a plain SSRI↔SNRI switch is routine
    expect(evaluateSwitch('escitalopram', 'duloxetine').specialistAdvised).toBe(false);
  });
});

describe('antidepressant switching — same drug & data integrity', () => {
  it('selecting the same drug needs no switch and no washout', () => {
    const r = evaluateSwitch('sertraline', 'sertraline');
    expect(r.sameDrug).toBe(true);
    expect(r.strategy).toBe('direct');
    expect(r.washout).toBeNull();
    expect(r.cautions).toHaveLength(0);
  });

  it('every drug has a unique id and an MAOI washout defined', () => {
    const ids = ANTIDEPRESSANTS.map((d) => d.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const d of ANTIDEPRESSANTS) {
      expect(d.maoiWashoutDays).toBeGreaterThan(0);
      expect(typeof d.maoiWashoutLabel).toBe('string');
    }
  });

  it('getDrug throws on an unknown id', () => {
    expect(() => getDrug('not-a-drug')).toThrow();
  });

  it('every from/to pair evaluates without throwing', () => {
    for (const a of ANTIDEPRESSANTS) {
      for (const b of ANTIDEPRESSANTS) {
        expect(() => evaluateSwitch(a.id, b.id)).not.toThrow();
      }
    }
  });
});
