import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  evaluateSwitch,
  ANTIDEPRESSANTS,
  CLASS_LABEL,
  STRATEGY_LABEL,
  type DrugClass,
  type Severity,
} from './switching';
import { buildSwitchSummary } from './summary';
import References, { type Reference } from '../../components/References';
import {
  SwitchIcon,
  ClipboardIcon,
  CopyIcon,
  PrinterIcon,
  ChevronLeftIcon,
  InfoIcon,
  CheckIcon,
  AlertIcon,
  ArrowRightIcon,
  HourglassIcon,
} from '../../components/icons';

const card = 'rounded-2xl border border-slate-200 bg-white p-5 shadow-sm';
const sectionTitle =
  'flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500';
const fieldLabel = 'text-sm font-medium text-slate-700';
const inputCls =
  'mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/25';

/** Display groupings for the drug pickers. */
const GROUPS: { label: string; classes: DrugClass[] }[] = [
  { label: 'SSRIs', classes: ['SSRI'] },
  { label: 'SNRIs', classes: ['SNRI'] },
  { label: 'Other agents', classes: ['NaSSA', 'SARI', 'multimodal', 'melatonergic', 'NRI'] },
  { label: 'Tricyclics (TCA)', classes: ['TCA'] },
  { label: 'MAOIs', classes: ['MAOI', 'RIMA'] },
];

const REFERENCES: Reference[] = [
  {
    label: 'NICE CKS — Depression in adults: Switching antidepressants.',
    href: 'https://cks.nice.org.uk/topics/depression/prescribing-information/switching-antidepressants/',
  },
  {
    label:
      'Taylor DM, Barnes TRE, Young AH. The Maudsley Prescribing Guidelines in Psychiatry — antidepressant switching tables.',
  },
  {
    label: 'BNF — Antidepressant drugs (incl. MAOI washout periods and special precautions).',
    href: 'https://bnf.nice.org.uk/treatment-summaries/antidepressant-drugs/',
  },
  {
    label:
      'There is no agreed dose equivalence between antidepressants — this tool gives switching strategy and washout, not a dose conversion.',
  },
];

const SEVERITY_STYLE: Record<Severity, { box: string; icon: string }> = {
  danger: { box: 'border-red-200 bg-red-50 text-red-900', icon: 'text-red-500' },
  warning: { box: 'border-amber-200 bg-amber-50 text-amber-900', icon: 'text-amber-500' },
  info: { box: 'border-slate-200 bg-slate-50 text-slate-700', icon: 'text-slate-400' },
};

function DrugSelect({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label htmlFor={id} className={fieldLabel}>
        {label}
      </label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className={inputCls}>
        {GROUPS.map((g) => {
          const items = ANTIDEPRESSANTS.filter((d) => g.classes.includes(d.class));
          if (items.length === 0) return null;
          return (
            <optgroup key={g.label} label={g.label}>
              {items.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </optgroup>
          );
        })}
      </select>
    </div>
  );
}

export default function AntidepressantSwitch() {
  const [fromId, setFromId] = useState('sertraline');
  const [toId, setToId] = useState('mirtazapine');
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => evaluateSwitch(fromId, toId), [fromId, toId]);

  async function copySummary() {
    try {
      await navigator.clipboard.writeText(buildSwitchSummary(result));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable — printable summary remains */
    }
  }

  return (
    <div>
      <div className="no-print mb-5">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-sm font-medium text-teal-700 hover:text-teal-900"
        >
          <ChevronLeftIcon className="h-4 w-4" />
          All tools
        </Link>
        <div className="mt-3 flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700 ring-1 ring-inset ring-teal-100">
            <SwitchIcon className="h-6 w-6" weight="duotone" />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Antidepressant Switching
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-slate-600">
              Recommended switching method, washout interval and key cautions for changing from one
              antidepressant to another. A decision-support guide — not a dose conversion.
            </p>
          </div>
        </div>
        <p className="mt-3 inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-xs text-slate-600">
          <InfoIcon className="h-4 w-4 shrink-0 text-slate-400" weight="fill" />
          Enter clinical choices only — no patient identifiers.
        </p>
      </div>

      <div className="space-y-5">
        <section className={`no-print ${card}`}>
          <h2 className={`mb-4 ${sectionTitle}`}>
            <SwitchIcon className="h-4 w-4 text-teal-600" weight="fill" />
            Switch
          </h2>
          <div className="grid items-end gap-4 sm:grid-cols-[1fr_auto_1fr]">
            <DrugSelect id="adsw-from" label="Switching from" value={fromId} onChange={setFromId} />
            <div className="hidden justify-center pb-2 sm:flex">
              <ArrowRightIcon className="h-5 w-5 text-slate-400" />
            </div>
            <DrugSelect id="adsw-to" label="Switching to" value={toId} onChange={setToId} />
          </div>
          <p className="mt-3 text-xs text-slate-500">
            {result.from.name} ({CLASS_LABEL[result.from.class]}) → {result.to.name} (
            {CLASS_LABEL[result.to.class]})
          </p>
        </section>

        <section className={card}>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className={sectionTitle}>
              <ClipboardIcon className="h-4 w-4 text-teal-600" weight="fill" />
              Recommended approach
            </h2>
            <div className="no-print flex gap-2">
              <button
                type="button"
                onClick={copySummary}
                className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700"
              >
                {copied ? <CheckIcon className="h-4 w-4" weight="bold" /> : <CopyIcon className="h-4 w-4" />}
                {copied ? 'Copied' : 'Copy summary'}
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                <PrinterIcon className="h-4 w-4" />
                Print
              </button>
            </div>
          </div>

          <div aria-live="polite">
            {result.sameDrug ? (
              <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-4 py-8 text-center text-sm text-slate-500">
                {result.detail}
              </p>
            ) : (
              <>
                <div className="rounded-xl border border-teal-200 bg-teal-50 p-5">
                  <p className="text-xs uppercase tracking-wide text-teal-700">Strategy</p>
                  <p className="mt-0.5 text-2xl font-extrabold tracking-tight text-teal-800">
                    {STRATEGY_LABEL[result.strategy]}
                  </p>
                  {result.washout && (
                    <p className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-white/70 px-2.5 py-1 text-sm font-semibold text-teal-800 ring-1 ring-inset ring-teal-200">
                      <HourglassIcon className="h-4 w-4" weight="fill" />
                      Washout: {result.washout.label}
                    </p>
                  )}
                  <p className="mt-3 text-sm leading-relaxed text-teal-900/90">{result.detail}</p>
                </div>

                {result.cautions.length > 0 && (
                  <ul className="mt-4 space-y-2.5">
                    {result.cautions.map((c, i) => {
                      const s = SEVERITY_STYLE[c.severity];
                      return (
                        <li
                          key={i}
                          className={`flex gap-2.5 rounded-xl border p-3 text-sm ${s.box}`}
                        >
                          <AlertIcon className={`mt-0.5 h-5 w-5 shrink-0 ${s.icon}`} weight="fill" />
                          <span>{c.text}</span>
                        </li>
                      );
                    })}
                  </ul>
                )}

                {result.specialistAdvised && (
                  <p className="mt-4 rounded-xl bg-slate-900 px-4 py-3 text-center text-sm font-semibold text-white">
                    Specialist (psychiatric) supervision is advised for this switch.
                  </p>
                )}
              </>
            )}
          </div>

          {!result.sameDrug && (
            <details className="mt-4">
              <summary className="inline-flex cursor-pointer items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900">
                <ArrowRightIcon className="h-3.5 w-3.5" />
                Plain-text summary (copyable)
              </summary>
              <pre className="mt-2 overflow-x-auto whitespace-pre-wrap rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
                {buildSwitchSummary(result)}
              </pre>
            </details>
          )}
        </section>

        <References
          note="Switching strategies follow NICE CKS and the Maudsley Guidelines; washout periods (especially for MAOIs and fluoxetine) follow the BNF. Antidepressants have no agreed dose equivalence, so no dose conversion is given. Always individualise to the patient and confirm against the current SmPC."
          items={REFERENCES}
        />
      </div>
    </div>
  );
}
