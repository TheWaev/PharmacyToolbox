/**
 * Antidepressant switching — pure, UI-decoupled, testable decision support.
 * Nothing here touches the DOM or the network.
 *
 * Given a FROM drug and a TO drug, it returns the recommended switching
 * strategy (direct / cross-taper / taper-then-start / washout), any drug-free
 * washout interval, and the safety-critical cautions for that pair.
 *
 * Clinical basis (verify against the current SmPC for any individual switch):
 *  - NICE CKS, "Depression in adults — Switching antidepressants".
 *  - The Maudsley Prescribing Guidelines in Psychiatry (switching tables).
 *  - BNF — antidepressant "Conditions and special precautions" / MAOI washout
 *    periods, and the BNF monographs for the individual drugs.
 *
 * IMPORTANT: antidepressants have no agreed 1:1 dose equivalence, so this tool
 * deliberately gives no dose conversion. MAOI switches and any complex case
 * should be done under specialist (psychiatric) supervision.
 */

export type DrugClass =
  | 'SSRI'
  | 'SNRI'
  | 'TCA'
  | 'MAOI' // irreversible, non-selective (phenelzine, tranylcypromine, isocarboxazid)
  | 'RIMA' // reversible inhibitor of MAO-A (moclobemide)
  | 'NaSSA' // mirtazapine
  | 'SARI' // trazodone
  | 'multimodal' // vortioxetine
  | 'melatonergic' // agomelatine
  | 'NRI'; // reboxetine

export const CLASS_LABEL: Record<DrugClass, string> = {
  SSRI: 'SSRI',
  SNRI: 'SNRI',
  TCA: 'Tricyclic (TCA)',
  MAOI: 'MAOI (irreversible)',
  RIMA: 'Reversible MAO-A inhibitor',
  NaSSA: 'NaSSA',
  SARI: 'SARI',
  multimodal: 'Multimodal',
  melatonergic: 'Melatonergic',
  NRI: 'NRI',
};

export interface Antidepressant {
  id: string;
  name: string;
  class: DrugClass;
  /** Adds to the serotonergic load (drives serotonin-toxicity cautions). */
  serotonergic: boolean;
  /** Long half-life: effectively self-tapers and persists after stopping. */
  longHalfLife?: boolean;
  /** Short half-life → prominent discontinuation symptoms; taper carefully. */
  prominentDiscontinuation?: boolean;
  /** CYP2D6 inhibition — raises co-prescribed TCA plasma levels. */
  cyp2d6Inhibitor?: 'strong' | 'moderate';
  /**
   * Drug-free interval to leave AFTER stopping this drug BEFORE starting an
   * (irreversible) MAOI or moclobemide — governed by how long this drug and its
   * active metabolites persist. Days are the lower bound; label is for display.
   */
  maoiWashoutDays: number;
  maoiWashoutLabel: string;
}

/** Washout to leave after stopping an irreversible MAOI before any new antidepressant. */
export const MAOI_STOP_WASHOUT_DAYS = 14;
export const MAOI_STOP_WASHOUT_LABEL = '2 weeks';
/** Washout after stopping moclobemide (reversible) before another antidepressant. */
export const RIMA_STOP_WASHOUT_DAYS = 1;
export const RIMA_STOP_WASHOUT_LABEL = 'at least 24 hours';

const wk1 = { maoiWashoutDays: 7, maoiWashoutLabel: '1 week' };
const wk2 = { maoiWashoutDays: 14, maoiWashoutLabel: '2 weeks' };
const wk3 = { maoiWashoutDays: 21, maoiWashoutLabel: '3 weeks' };

export const ANTIDEPRESSANTS: Antidepressant[] = [
  // SSRIs
  { id: 'citalopram', name: 'Citalopram', class: 'SSRI', serotonergic: true, ...wk1 },
  { id: 'escitalopram', name: 'Escitalopram', class: 'SSRI', serotonergic: true, ...wk1 },
  {
    id: 'fluoxetine',
    name: 'Fluoxetine',
    class: 'SSRI',
    serotonergic: true,
    longHalfLife: true,
    cyp2d6Inhibitor: 'strong',
    maoiWashoutDays: 35,
    maoiWashoutLabel: '5 to 6 weeks',
  },
  { id: 'fluvoxamine', name: 'Fluvoxamine', class: 'SSRI', serotonergic: true, ...wk1 },
  {
    id: 'paroxetine',
    name: 'Paroxetine',
    class: 'SSRI',
    serotonergic: true,
    prominentDiscontinuation: true,
    cyp2d6Inhibitor: 'strong',
    ...wk2,
  },
  { id: 'sertraline', name: 'Sertraline', class: 'SSRI', serotonergic: true, ...wk2 },

  // SNRIs
  {
    id: 'venlafaxine',
    name: 'Venlafaxine',
    class: 'SNRI',
    serotonergic: true,
    prominentDiscontinuation: true,
    ...wk1,
  },
  {
    id: 'duloxetine',
    name: 'Duloxetine',
    class: 'SNRI',
    serotonergic: true,
    cyp2d6Inhibitor: 'moderate',
    ...wk1,
  },

  // Other newer / atypical agents
  { id: 'mirtazapine', name: 'Mirtazapine', class: 'NaSSA', serotonergic: false, ...wk1 },
  { id: 'trazodone', name: 'Trazodone', class: 'SARI', serotonergic: true, ...wk1 },
  {
    id: 'vortioxetine',
    name: 'Vortioxetine',
    class: 'multimodal',
    serotonergic: true,
    longHalfLife: true,
    ...wk2,
  },
  {
    id: 'agomelatine',
    name: 'Agomelatine',
    class: 'melatonergic',
    serotonergic: false,
    maoiWashoutDays: 1,
    maoiWashoutLabel: 'short half-life — confirm interval with specialist/SmPC',
  },
  { id: 'reboxetine', name: 'Reboxetine', class: 'NRI', serotonergic: false, ...wk1 },

  // Tricyclics
  { id: 'amitriptyline', name: 'Amitriptyline', class: 'TCA', serotonergic: true, ...wk2 },
  { id: 'nortriptyline', name: 'Nortriptyline', class: 'TCA', serotonergic: true, ...wk2 },
  { id: 'lofepramine', name: 'Lofepramine', class: 'TCA', serotonergic: true, ...wk2 },
  { id: 'dosulepin', name: 'Dosulepin', class: 'TCA', serotonergic: true, ...wk2 },
  {
    id: 'clomipramine',
    name: 'Clomipramine',
    class: 'TCA',
    serotonergic: true,
    ...wk3, // BNF: 3 weeks before an MAOI; highly serotonergic
  },
  { id: 'imipramine', name: 'Imipramine', class: 'TCA', serotonergic: true, ...wk3 },

  // MAOIs
  { id: 'phenelzine', name: 'Phenelzine', class: 'MAOI', serotonergic: true, ...wk2 },
  { id: 'tranylcypromine', name: 'Tranylcypromine', class: 'MAOI', serotonergic: true, ...wk2 },
  { id: 'isocarboxazid', name: 'Isocarboxazid', class: 'MAOI', serotonergic: true, ...wk2 },
  { id: 'moclobemide', name: 'Moclobemide', class: 'RIMA', serotonergic: true, ...wk1 },
];

export function getDrug(id: string): Antidepressant {
  const d = ANTIDEPRESSANTS.find((x) => x.id === id);
  if (!d) throw new Error(`Unknown antidepressant: ${id}`);
  return d;
}

export type StrategyKey = 'direct' | 'cross-taper' | 'taper-then-start' | 'washout';

export const STRATEGY_LABEL: Record<StrategyKey, string> = {
  direct: 'Direct switch',
  'cross-taper': 'Cross-taper',
  'taper-then-start': 'Taper / stop, then start',
  washout: 'Washout (drug-free interval)',
};

export type Severity = 'danger' | 'warning' | 'info';

export interface Caution {
  severity: Severity;
  text: string;
}

export interface Washout {
  days: number;
  label: string;
  reason: string;
}

export interface SwitchResult {
  ok: boolean;
  from: Antidepressant;
  to: Antidepressant;
  sameDrug: boolean;
  strategy: StrategyKey;
  /** The "how to do it" sentence(s). */
  detail: string;
  washout: Washout | null;
  cautions: Caution[];
  /** Whether specialist (psychiatric) supervision is advised for this switch. */
  specialistAdvised: boolean;
}

const SEVERITY_ORDER: Record<Severity, number> = { danger: 0, warning: 1, info: 2 };

function sortCautions(cautions: Caution[]): Caution[] {
  return [...cautions].sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]);
}

const SEROTONIN_TOXICITY_NOTE =
  'Monitor for serotonin toxicity during any overlap — agitation, sweating, tremor, hyperreflexia, clonus, fever. Keep the overlap short and doses conservative.';

/**
 * Determine the switching strategy and cautions for a FROM → TO antidepressant
 * pair. Conservative by design: where guidance is uncertain it defaults to a
 * cautious cross-taper and recommends checking the SmPC / specialist advice.
 */
export function evaluateSwitch(fromId: string, toId: string): SwitchResult {
  const from = getDrug(fromId);
  const to = getDrug(toId);

  const base = {
    ok: true,
    from,
    to,
    sameDrug: from.id === to.id,
  } as const;

  // --- Same drug ---------------------------------------------------------
  if (from.id === to.id) {
    return {
      ...base,
      strategy: 'direct',
      detail:
        'Same medicine selected — no switch required. To change the dose, titrate up or down per the SmPC.',
      washout: null,
      cautions: [],
      specialistAdvised: false,
    };
  }

  const cautions: Caution[] = [];
  const involvesMaoi =
    from.class === 'MAOI' || to.class === 'MAOI' || from.class === 'RIMA' || to.class === 'RIMA';

  // ======================================================================
  // MAOI / moclobemide pathway — always a washout, never an overlap.
  // ======================================================================
  if (involvesMaoi) {
    cautions.push({
      severity: 'danger',
      text:
        'Never co-administer or cross-taper an MAOI with another antidepressant — risk of fatal serotonin syndrome and hypertensive crisis. A complete drug-free washout is mandatory.',
    });

    let washout: Washout;
    let detail: string;

    if (from.class === 'MAOI') {
      // Stopping an irreversible MAOI before anything else.
      washout = {
        days: MAOI_STOP_WASHOUT_DAYS,
        label: MAOI_STOP_WASHOUT_LABEL,
        reason: 'to allow regeneration of monoamine oxidase after an irreversible inhibitor',
      };
      detail = `Stop ${from.name}, then leave a ${MAOI_STOP_WASHOUT_LABEL} drug-free washout before starting ${to.name} at a low dose.`;
    } else if (from.class === 'RIMA') {
      // Stopping moclobemide (reversible) — short interval.
      washout = {
        days: RIMA_STOP_WASHOUT_DAYS,
        label: RIMA_STOP_WASHOUT_LABEL,
        reason: 'moclobemide is reversible and short-acting',
      };
      detail = `Stop ${from.name}, then leave ${RIMA_STOP_WASHOUT_LABEL} before starting ${to.name} at a low dose.`;
    } else {
      // Starting an MAOI or moclobemide from a non-MAOI — interval set by how
      // long the drug being stopped persists.
      washout = {
        days: from.maoiWashoutDays,
        label: from.maoiWashoutLabel,
        reason: `time for ${from.name} (and its active metabolites) to clear before starting an MAO inhibitor`,
      };
      detail = `Stop ${from.name}, then leave a washout of ${from.maoiWashoutLabel} before starting ${to.name} at a low dose.`;
      if (from.longHalfLife) {
        cautions.push({
          severity: 'warning',
          text: `${from.name} has a long half-life, so this washout is correspondingly long — do not shorten it.`,
        });
      }
      if (to.class === 'MAOI') {
        cautions.push({
          severity: 'warning',
          text:
            'When starting an irreversible MAOI, counsel on the tyramine ("cheese") dietary restrictions and interacting medicines (incl. sympathomimetics, opioids such as pethidine/tramadol).',
        });
      }
      if (to.class === 'RIMA') {
        cautions.push({
          severity: 'info',
          text:
            'Moclobemide is a reversible MAO-A inhibitor with fewer dietary restrictions than irreversible MAOIs, but the washout before starting it is still governed by the drug being stopped.',
        });
      }
    }

    return {
      ...base,
      strategy: 'washout',
      detail,
      washout,
      cautions: sortCautions(cautions),
      specialistAdvised: true,
    };
  }

  // ======================================================================
  // Non-MAOI pathway
  // ======================================================================
  let strategy: StrategyKey;
  let detail: string;
  let specialistAdvised = false;

  const bothSerotonergic = from.serotonergic && to.serotonergic;
  const hasTCA = from.class === 'TCA' || to.class === 'TCA';
  const cypInhibitorPresent = Boolean(from.cyp2d6Inhibitor || to.cyp2d6Inhibitor);

  if (from.longHalfLife && from.id === 'fluoxetine') {
    // Fluoxetine self-tapers; cross-tapering is inappropriate.
    strategy = 'taper-then-start';
    detail = `Stop ${from.name} and start ${to.name} at a low dose. ${from.name} has a long half-life (its active metabolite persists ~1–2 weeks), so it effectively self-tapers — do not cross-taper.`;
    cautions.push({
      severity: 'warning',
      text: `${from.name} and its CYP2D6 inhibition persist for some weeks after stopping, so interactions and serotonergic effects continue during that window.`,
    });
    if (bothSerotonergic) {
      cautions.push({ severity: 'warning', text: SEROTONIN_TOXICITY_NOTE });
    }
  } else {
    // Default for SSRI↔SSRI, SSRI↔SNRI, →mirtazapine, →trazodone, TCA switches, etc.
    strategy = 'cross-taper';
    detail = `Cross-taper cautiously: gradually reduce ${from.name} while gradually introducing and titrating ${to.name}, over ~1–4 weeks depending on doses and tolerability. Some low-dose, same-class switches may be done directly — use clinical judgement.`;
    if (bothSerotonergic) {
      cautions.push({ severity: 'warning', text: SEROTONIN_TOXICITY_NOTE });
    }
  }

  // TCA + CYP2D6 inhibitor → raised TCA levels.
  if (hasTCA && cypInhibitorPresent) {
    const tca = from.class === 'TCA' ? from : to;
    cautions.push({
      severity: 'warning',
      text: `A CYP2D6 inhibitor is involved, which can raise ${tca.name} plasma levels (cardiotoxicity / anticholinergic effects) — start the tricyclic low, titrate slowly and monitor (consider ECG).`,
    });
  }

  // Clomipramine is strongly serotonergic.
  if (from.id === 'clomipramine' || to.id === 'clomipramine') {
    specialistAdvised = true;
    cautions.push({
      severity: 'warning',
      text:
        'Clomipramine is strongly serotonergic — heightened serotonin-toxicity risk on cross-taper; consider specialist advice.',
    });
  }

  // Discontinuation symptoms on the drug being withdrawn.
  if (from.prominentDiscontinuation) {
    cautions.push({
      severity: 'warning',
      text: `${from.name} has a short half-life and prominent discontinuation symptoms — taper it slowly to avoid withdrawal effects.`,
    });
  }

  // Agomelatine target — minimal interaction but needs LFT monitoring.
  if (to.id === 'agomelatine') {
    cautions.push({
      severity: 'info',
      text:
        'Agomelatine has minimal serotonergic interaction and can usually be introduced while the previous drug is tapered; baseline and periodic LFTs are required.',
    });
  }

  // Long-half-life target.
  if (to.longHalfLife && to.id !== 'fluoxetine') {
    cautions.push({
      severity: 'info',
      text: `${to.name} has a long half-life, so allow extra time to reach steady state when titrating.`,
    });
  }

  // Always-on guidance footer.
  cautions.push({
    severity: 'info',
    text:
      'A guide based on NICE CKS, the Maudsley Guidelines and the BNF — confirm against the current SmPC and seek specialist advice for complex switches or where the patient is frail, elderly or has comorbidity.',
  });

  return {
    ...base,
    strategy,
    detail,
    washout: null,
    cautions: sortCautions(cautions),
    specialistAdvised,
  };
}
