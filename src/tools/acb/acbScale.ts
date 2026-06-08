/**
 * Anticholinergic Cognitive Burden (ACB) scale — pure scoring + drug list.
 *
 * Data: ACB Scale, 2012 update, © Regenstrief Institute / Aging Brain Care
 * (Boustani et al. 2008). Reproduced with attribution; use per the scale's
 * Terms of Use. Generic names are UK-adjusted where they differ from the
 * original (the original US name is kept as a searchable alias).
 *
 * Scoring: each drug scores 1 (mild), 2 (moderate) or 3 (severe). The patient's
 * total ACB is the sum across their medicines; a total of 3 or more is clinically
 * significant. Scores 2–3 are "definite" anticholinergics.
 */

export type AcbScore = 1 | 2 | 3;

export interface AcbDrug {
  name: string;
  score: AcbScore;
  /** Alternative names (e.g. original US generic) to match on search. */
  aliases?: string[];
}

const RAW_ACB_DRUGS: AcbDrug[] = [
  // Score 1
  { name: 'Alimemazine', score: 1 },
  { name: 'Alprazolam', score: 1 },
  { name: 'Alverine', score: 1 },
  { name: 'Aripiprazole', score: 1 },
  { name: 'Asenapine', score: 1 },
  { name: 'Atenolol', score: 1 },
  { name: 'Bupropion', score: 1 },
  { name: 'Captopril', score: 1 },
  { name: 'Cetirizine', score: 1 },
  { name: 'Chlortalidone', score: 1, aliases: ['Chlorthalidone'] },
  { name: 'Cimetidine', score: 1 },
  { name: 'Clidinium', score: 1 },
  { name: 'Clorazepate', score: 1 },
  { name: 'Codeine', score: 1 },
  { name: 'Colchicine', score: 1 },
  { name: 'Desloratadine', score: 1 },
  { name: 'Diazepam', score: 1 },
  { name: 'Digoxin', score: 1 },
  { name: 'Dipyridamole', score: 1 },
  { name: 'Disopyramide', score: 1 },
  { name: 'Fentanyl', score: 1 },
  { name: 'Fluvoxamine', score: 1 },
  { name: 'Furosemide', score: 1 },
  { name: 'Haloperidol', score: 1 },
  { name: 'Hydralazine', score: 1 },
  { name: 'Hydrocortisone', score: 1 },
  { name: 'Iloperidone', score: 1 },
  { name: 'Isosorbide', score: 1 },
  { name: 'Levocetirizine', score: 1 },
  { name: 'Loperamide', score: 1 },
  { name: 'Loratadine', score: 1 },
  { name: 'Metoprolol', score: 1 },
  { name: 'Morphine', score: 1 },
  { name: 'Nifedipine', score: 1 },
  { name: 'Paliperidone', score: 1 },
  { name: 'Prednisolone', score: 1, aliases: ['Prednisone'] },
  { name: 'Quinidine', score: 1 },
  { name: 'Ranitidine', score: 1 },
  { name: 'Risperidone', score: 1 },
  { name: 'Theophylline', score: 1 },
  { name: 'Trazodone', score: 1 },
  { name: 'Triamterene', score: 1 },
  { name: 'Venlafaxine', score: 1 },
  { name: 'Warfarin', score: 1 },
  // Score 2
  { name: 'Amantadine', score: 2 },
  { name: 'Belladonna alkaloids', score: 2 },
  { name: 'Carbamazepine', score: 2 },
  { name: 'Cyclobenzaprine', score: 2 },
  { name: 'Cyproheptadine', score: 2 },
  { name: 'Levomepromazine', score: 2, aliases: ['Methotrimeprazine'] },
  { name: 'Loxapine', score: 2 },
  { name: 'Molindone', score: 2 },
  { name: 'Nefopam', score: 2 },
  { name: 'Oxcarbazepine', score: 2 },
  { name: 'Pethidine', score: 2, aliases: ['Meperidine'] },
  { name: 'Pimozide', score: 2 },
  // Score 3
  { name: 'Amitriptyline', score: 3 },
  { name: 'Amoxapine', score: 3 },
  { name: 'Atropine', score: 3 },
  { name: 'Benzatropine', score: 3, aliases: ['Benztropine'] },
  { name: 'Brompheniramine', score: 3 },
  { name: 'Carbinoxamine', score: 3 },
  { name: 'Chlorphenamine', score: 3, aliases: ['Chlorpheniramine'] },
  { name: 'Chlorpromazine', score: 3 },
  { name: 'Clemastine', score: 3 },
  { name: 'Clomipramine', score: 3 },
  { name: 'Clozapine', score: 3 },
  { name: 'Darifenacin', score: 3 },
  { name: 'Desipramine', score: 3 },
  { name: 'Dicycloverine', score: 3, aliases: ['Dicyclomine'] },
  { name: 'Dimenhydrinate', score: 3 },
  { name: 'Diphenhydramine', score: 3 },
  { name: 'Doxepin', score: 3 },
  { name: 'Doxylamine', score: 3 },
  { name: 'Fesoterodine', score: 3 },
  { name: 'Flavoxate', score: 3 },
  { name: 'Hydroxyzine', score: 3 },
  { name: 'Hyoscine hydrobromide', score: 3, aliases: ['Scopolamine', 'Hyoscine'] },
  { name: 'Hyoscyamine', score: 3 },
  { name: 'Imipramine', score: 3 },
  { name: 'Meclozine', score: 3, aliases: ['Meclizine'] },
  { name: 'Methocarbamol', score: 3 },
  { name: 'Nortriptyline', score: 3 },
  { name: 'Olanzapine', score: 3 },
  { name: 'Orphenadrine', score: 3 },
  { name: 'Oxybutynin', score: 3 },
  { name: 'Paroxetine', score: 3 },
  { name: 'Perphenazine', score: 3 },
  { name: 'Promethazine', score: 3 },
  { name: 'Propantheline', score: 3 },
  { name: 'Propiverine', score: 3 },
  { name: 'Quetiapine', score: 3 },
  { name: 'Solifenacin', score: 3 },
  { name: 'Thioridazine', score: 3 },
  { name: 'Tolterodine', score: 3 },
  { name: 'Trifluoperazine', score: 3 },
  { name: 'Trihexyphenidyl', score: 3, aliases: ['Benzhexol'] },
  { name: 'Trimipramine', score: 3 },
  { name: 'Trospium', score: 3 },
];

// Sorted alphabetically by name.
export const ACB_DRUGS: AcbDrug[] = [...RAW_ACB_DRUGS].sort((a, b) =>
  a.name.localeCompare(b.name),
);

const byName = new Map(ACB_DRUGS.map((d) => [d.name, d]));

export interface AcbResult {
  total: number;
  /** Count of "definite" anticholinergics (score 2 or 3). */
  definiteCount: number;
  selected: AcbDrug[];
  significant: boolean; // total >= 3
}

export function scoreAcb(selectedNames: string[]): AcbResult {
  const selected = selectedNames.map((n) => byName.get(n)).filter((d): d is AcbDrug => Boolean(d));
  const total = selected.reduce((s, d) => s + d.score, 0);
  const definiteCount = selected.filter((d) => d.score >= 2).length;
  return { total, definiteCount, selected, significant: total >= 3 };
}

/** Case-insensitive search over names + aliases. */
export function searchAcb(query: string): AcbDrug[] {
  const q = query.trim().toLowerCase();
  if (q === '') return ACB_DRUGS;
  return ACB_DRUGS.filter(
    (d) =>
      d.name.toLowerCase().includes(q) ||
      (d.aliases ?? []).some((a) => a.toLowerCase().includes(q)),
  );
}
