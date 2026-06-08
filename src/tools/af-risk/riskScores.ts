/**
 * Pure scoring for atrial-fibrillation stroke risk (CHA₂DS₂-VASc) and bleeding
 * risk (HAS-BLED). UI-decoupled and testable. Decision aid only.
 *
 * Thresholds follow NICE NG196. Note: NG196 now prefers the ORBIT score over
 * HAS-BLED for bleeding risk; HAS-BLED remains widely used and is included here.
 */

export type Sex = 'male' | 'female';

export interface ScoreItem {
  label: string;
  points: number;
}

// ---------- CHA₂DS₂-VASc ----------

export interface ChadsVascInput {
  age: number | null;
  sex: Sex;
  chf: boolean; // congestive heart failure / LV dysfunction
  hypertension: boolean;
  diabetes: boolean;
  strokeTia: boolean; // prior stroke / TIA / thromboembolism (2 points)
  vascular: boolean; // MI, peripheral arterial disease, aortic plaque
}

export interface ChadsVascResult {
  score: number;
  items: ScoreItem[];
  recommendation: string;
}

function agePoints(age: number | null): number {
  if (age == null) return 0;
  if (age >= 75) return 2;
  if (age >= 65) return 1;
  return 0;
}

export function chadsVasc(i: ChadsVascInput): ChadsVascResult {
  const items: ScoreItem[] = [
    { label: 'Congestive heart failure / LV dysfunction', points: i.chf ? 1 : 0 },
    { label: 'Hypertension', points: i.hypertension ? 1 : 0 },
    {
      label: i.age != null && i.age >= 75 ? 'Age ≥75' : i.age != null && i.age >= 65 ? 'Age 65–74' : 'Age',
      points: agePoints(i.age),
    },
    { label: 'Diabetes', points: i.diabetes ? 1 : 0 },
    { label: 'Prior stroke / TIA / thromboembolism', points: i.strokeTia ? 2 : 0 },
    { label: 'Vascular disease', points: i.vascular ? 1 : 0 },
    { label: 'Sex category (female)', points: i.sex === 'female' ? 1 : 0 },
  ];
  const score = items.reduce((s, it) => s + it.points, 0);

  let recommendation: string;
  if (i.sex === 'female') {
    recommendation =
      score >= 2
        ? 'Offer anticoagulation (weigh against bleeding risk).'
        : 'Anticoagulation not recommended on stroke risk alone (sex point only).';
  } else {
    recommendation =
      score >= 2
        ? 'Offer anticoagulation (weigh against bleeding risk).'
        : score === 1
          ? 'Consider anticoagulation (weigh against bleeding risk).'
          : 'Anticoagulation not recommended on stroke risk alone.';
  }

  return { score, items, recommendation };
}

// ---------- HAS-BLED ----------

export interface HasBledInput {
  age: number | null; // elderly = age > 65
  hypertensionUncontrolled: boolean; // systolic BP > 160 mmHg
  abnormalRenal: boolean;
  abnormalLiver: boolean;
  stroke: boolean;
  bleeding: boolean; // prior major bleeding or predisposition
  labileINR: boolean; // on warfarin, time in therapeutic range < 60%
  drugs: boolean; // concurrent antiplatelet / NSAID
  alcohol: boolean; // ≥ 8 units/week
}

export interface HasBledResult {
  score: number;
  items: ScoreItem[];
  recommendation: string;
}

export function hasBled(i: HasBledInput): HasBledResult {
  const items: ScoreItem[] = [
    { label: 'Uncontrolled hypertension (SBP > 160)', points: i.hypertensionUncontrolled ? 1 : 0 },
    { label: 'Abnormal renal function', points: i.abnormalRenal ? 1 : 0 },
    { label: 'Abnormal liver function', points: i.abnormalLiver ? 1 : 0 },
    { label: 'Stroke history', points: i.stroke ? 1 : 0 },
    { label: 'Bleeding history or predisposition', points: i.bleeding ? 1 : 0 },
    { label: 'Labile INR (TTR < 60%)', points: i.labileINR ? 1 : 0 },
    { label: 'Elderly (age > 65)', points: i.age != null && i.age > 65 ? 1 : 0 },
    { label: 'Drugs (antiplatelet / NSAID)', points: i.drugs ? 1 : 0 },
    { label: 'Alcohol (≥ 8 units/week)', points: i.alcohol ? 1 : 0 },
  ];
  const score = items.reduce((s, it) => s + it.points, 0);
  const recommendation =
    score >= 3
      ? 'High bleeding risk — address modifiable factors (BP, alcohol, NSAIDs/antiplatelets) and review regularly. A high score is NOT a contraindication to anticoagulation.'
      : 'Lower bleeding risk. Continue to address modifiable risk factors.';
  return { score, items, recommendation };
}
