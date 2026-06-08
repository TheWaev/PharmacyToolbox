import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ACB_DRUGS, scoreAcb, searchAcb, type AcbScore } from './acbScale';
import { buildAcbSummary } from './summary';
import References, { type Reference } from '../../components/References';
import {
  BrainIcon,
  SearchIcon,
  XIcon,
  CopyIcon,
  PrinterIcon,
  ChevronLeftIcon,
  InfoIcon,
  CheckIcon,
} from '../../components/icons';

const card = 'rounded-2xl border border-slate-200 bg-white p-5 shadow-sm';
const sectionTitle =
  'flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500';

const REFERENCES: Reference[] = [
  {
    label:
      'Boustani M, Campbell N, Munger S, Maidment I, Fox C. Impact of anticholinergics on the aging brain. Aging Health. 2008;4(3):311–320.',
  },
  {
    label: 'ACB Scale, 2012 update — © Regenstrief Institute / Aging Brain Care (agingbraincare.org). Used with attribution per its Terms of Use.',
    href: 'https://www.acbcalc.com/',
  },
  {
    label:
      'Fox C, Richardson K, Maidment I, et al. Anticholinergic medication use and cognitive impairment (MRC CFAS). J Am Geriatr Soc. 2011;59(8):1477–1483.',
  },
];

const scoreBadge: Record<AcbScore, string> = {
  1: 'bg-slate-100 text-slate-600',
  2: 'bg-amber-100 text-amber-700',
  3: 'bg-red-100 text-red-700',
};

export default function AcbCalc() {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => scoreAcb(selected), [selected]);
  const matches = useMemo(
    () => searchAcb(query).filter((d) => !selected.includes(d.name)),
    [query, selected],
  );

  function add(name: string) {
    setSelected((prev) => (prev.includes(name) ? prev : [...prev, name]));
    setQuery('');
  }
  function remove(name: string) {
    setSelected((prev) => prev.filter((n) => n !== name));
  }

  async function copySummary() {
    try {
      await navigator.clipboard.writeText(buildAcbSummary(selected));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  }

  const tone = result.significant ? 'amber' : 'teal';

  return (
    <div>
      <div className="no-print mb-5">
        <Link to="/" className="inline-flex items-center gap-1 text-sm font-medium text-teal-700 hover:text-teal-900">
          <ChevronLeftIcon className="h-4 w-4" />
          All tools
        </Link>
        <div className="mt-3 flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700 ring-1 ring-inset ring-teal-100">
            <BrainIcon className="h-6 w-6" weight="duotone" />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Anticholinergic Burden (ACB)
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-slate-600">
              Add the patient's medicines to total their anticholinergic cognitive burden. A score
              of <strong>3 or more</strong> is clinically significant — consider review/deprescribing.
            </p>
          </div>
        </div>
        <p className="mt-3 inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-xs text-slate-600">
          <InfoIcon className="h-4 w-4 shrink-0 text-slate-400" weight="fill" />
          Medicines only — no patient identifiers. Covers the {ACB_DRUGS.length} drugs on the ACB scale.
        </p>
      </div>

      <div className="space-y-5">
        {/* Result banner */}
        <section
          className={[
            'rounded-2xl border p-5',
            tone === 'amber' ? 'border-amber-200 bg-amber-50' : 'border-teal-200 bg-teal-50',
          ].join(' ')}
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className={`text-xs uppercase tracking-wide ${tone === 'amber' ? 'text-amber-700' : 'text-teal-700'}`}>
                Total ACB score
              </p>
              <p className={`text-sm ${tone === 'amber' ? 'text-amber-800' : 'text-teal-800'}`}>
                {result.significant
                  ? 'Clinically significant (≥3) — consider reviewing/deprescribing anticholinergics.'
                  : 'Below the significant threshold (3).'}
                {result.definiteCount > 0 && ` ${result.definiteCount} definite anticholinergic${result.definiteCount > 1 ? 's' : ''}.`}
              </p>
            </div>
            <span
              className={[
                'flex h-14 min-w-14 items-center justify-center rounded-xl px-3 text-3xl font-extrabold tabular-nums',
                tone === 'amber' ? 'bg-amber-100 text-amber-700' : 'bg-teal-100 text-teal-700',
              ].join(' ')}
            >
              {result.total}
            </span>
          </div>

          {result.selected.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-2">
              {result.selected.map((d) => (
                <li key={d.name}>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white py-1 pl-3 pr-1.5 text-sm text-slate-700">
                    {d.name}
                    <span className={`rounded-full px-1.5 text-xs font-semibold ${scoreBadge[d.score]}`}>
                      {d.score}
                    </span>
                    <button
                      type="button"
                      onClick={() => remove(d.name)}
                      aria-label={`Remove ${d.name}`}
                      className="no-print rounded-full p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                    >
                      <XIcon className="h-3.5 w-3.5" />
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Search / add */}
        <section className={`no-print ${card}`} aria-labelledby="add-heading">
          <h2 id="add-heading" className={`mb-3 ${sectionTitle}`}>
            <SearchIcon className="h-4 w-4 text-teal-600" weight="bold" />
            Add a medicine
          </h2>
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search the ACB drug list…"
              className="block w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm shadow-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/25"
            />
          </div>
          <ul className="mt-3 max-h-72 divide-y divide-slate-100 overflow-y-auto rounded-lg border border-slate-200">
            {matches.length === 0 ? (
              <li className="px-3 py-3 text-sm text-slate-400">No matching ACB-scale drugs.</li>
            ) : (
              matches.map((d) => (
                <li key={d.name}>
                  <button
                    type="button"
                    onClick={() => add(d.name)}
                    className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-teal-50"
                  >
                    <span>
                      {d.name}
                      {d.aliases && <span className="ml-1.5 text-xs text-slate-400">({d.aliases[0]})</span>}
                    </span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${scoreBadge[d.score]}`}>
                      ACB {d.score}
                    </span>
                  </button>
                </li>
              ))
            )}
          </ul>
        </section>

        <div className="no-print flex gap-2">
          <button type="button" onClick={copySummary} disabled={selected.length === 0}
            className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50">
            {copied ? <CheckIcon className="h-4 w-4" weight="bold" /> : <CopyIcon className="h-4 w-4" />}
            {copied ? 'Copied' : 'Copy summary'}
          </button>
          <button type="button" onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
            <PrinterIcon className="h-4 w-4" />
            Print
          </button>
        </div>

        <References
          note="Scores per the ACB Scale (2012 update). Higher totals correlate with greater risk of cognitive impairment; review is especially relevant in older or frail patients."
          items={REFERENCES}
        />
      </div>
    </div>
  );
}
