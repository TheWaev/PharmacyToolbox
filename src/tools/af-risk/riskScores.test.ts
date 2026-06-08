import { describe, it, expect } from 'vitest';
import { chadsVasc, hasBled, type ChadsVascInput, type HasBledInput } from './riskScores';

function cv(p: Partial<ChadsVascInput>): ChadsVascInput {
  return {
    age: 50,
    sex: 'male',
    chf: false,
    hypertension: false,
    diabetes: false,
    strokeTia: false,
    vascular: false,
    ...p,
  };
}

function hb(p: Partial<HasBledInput>): HasBledInput {
  return {
    age: 50,
    hypertensionUncontrolled: false,
    abnormalRenal: false,
    abnormalLiver: false,
    stroke: false,
    bleeding: false,
    labileINR: false,
    drugs: false,
    alcohol: false,
    ...p,
  };
}

describe('CHA₂DS₂-VASc', () => {
  it('scores age bands (mutually exclusive)', () => {
    expect(chadsVasc(cv({ age: 64 })).score).toBe(0);
    expect(chadsVasc(cv({ age: 70 })).score).toBe(1);
    expect(chadsVasc(cv({ age: 80 })).score).toBe(2);
  });

  it('sums risk factors and the stroke 2-pointer', () => {
    const r = chadsVasc(cv({ age: 80, hypertension: true, diabetes: true, strokeTia: true }));
    // age75+ (2) + HTN (1) + DM (1) + stroke (2) = 6
    expect(r.score).toBe(6);
  });

  it('female sex adds a point', () => {
    expect(chadsVasc(cv({ sex: 'female', age: 50 })).score).toBe(1);
  });

  it('NICE thresholds for men: 0 none, 1 consider, ≥2 offer', () => {
    expect(chadsVasc(cv({ age: 50 })).recommendation).toMatch(/not recommended/i);
    expect(chadsVasc(cv({ age: 70 })).recommendation).toMatch(/consider/i);
    expect(chadsVasc(cv({ age: 80 })).recommendation).toMatch(/offer/i);
  });

  it('women with only the sex point are not treated; ≥2 offer', () => {
    expect(chadsVasc(cv({ sex: 'female', age: 50 })).recommendation).toMatch(/not recommended/i);
    expect(chadsVasc(cv({ sex: 'female', age: 70 })).recommendation).toMatch(/offer/i); // sex+age65-74 = 2
  });
});

describe('HAS-BLED', () => {
  it('elderly point applies above 65', () => {
    expect(hasBled(hb({ age: 65 })).score).toBe(0);
    expect(hasBled(hb({ age: 66 })).score).toBe(1);
  });

  it('sums all components', () => {
    const r = hasBled(
      hb({
        age: 70,
        hypertensionUncontrolled: true,
        abnormalRenal: true,
        stroke: true,
        bleeding: true,
        drugs: true,
      }),
    );
    // elderly(1)+HTN(1)+renal(1)+stroke(1)+bleeding(1)+drugs(1) = 6
    expect(r.score).toBe(6);
  });

  it('flags high bleeding risk at ≥3 (not a contraindication)', () => {
    expect(hasBled(hb({ age: 70, bleeding: true })).recommendation).toMatch(/lower bleeding risk/i);
    const high = hasBled(hb({ age: 70, bleeding: true, drugs: true })); // 3
    expect(high.recommendation).toMatch(/high bleeding risk/i);
    expect(high.recommendation).toMatch(/not a contraindication/i);
  });
});
