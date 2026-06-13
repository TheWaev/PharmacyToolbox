import { Link } from 'react-router-dom';
import { tools, TOOL_CATEGORIES, type ToolDef } from '../tools/registry';
import { ArrowRightIcon, ShieldIcon } from '../components/icons';

/** Compact beta marker: a "B" chip that expands to "BETA" when the tile is hovered. */
function BetaTag() {
  return (
    <span
      title="Beta — undergoing clinical validation; check results before relying on them"
      aria-label="Beta"
      className="inline-flex h-5 items-center rounded-full bg-amber-50 px-1.5 text-[10px] font-bold uppercase leading-none tracking-wide text-amber-700 ring-1 ring-inset ring-amber-200"
    >
      B
      <span className="max-w-0 overflow-hidden whitespace-nowrap opacity-0 transition-all duration-fast group-hover/tile:max-w-[2rem] group-hover/tile:opacity-100">
        eta
      </span>
    </span>
  );
}

export default function Home() {
  const availableCount = tools.filter((t) => t.status === 'available').length;
  const grouped = TOOL_CATEGORIES.map((category) => ({
    category,
    items: tools.filter((t) => t.category === category),
  })).filter((g) => g.items.length > 0);

  return (
    <div>
      {/* Page heading */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-x-4 gap-y-3 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">Clinical pharmacy tools</h1>
          <p className="mt-1 max-w-xl text-sm text-slate-600">
            A focused suite of calculators for clinical pharmacy teams — fast, accurate, and safe.
            <span className="ml-1.5 text-ink-subtle">· {availableCount} tools</span>
          </p>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-teal-200 bg-teal-50 px-3 py-1.5 text-xs font-medium text-teal-800">
          <ShieldIcon className="h-3.5 w-3.5" weight="fill" />
          Runs in your browser — nothing you enter is recorded
        </span>
      </div>

      {/* Tools, on a faint pegboard that bleeds to the edges and fades out L/R */}
      <div className="pegboard -mx-4 px-4 py-2 sm:-mx-6 sm:px-6">
        <div className="space-y-7">
          {grouped.map(({ category, items }) => (
            <section key={category}>
              <div className="mb-3 flex items-center justify-between gap-2.5">
                <h2 className="inline-flex items-center rounded-md border border-slate-300/80 bg-white px-2.5 py-1 font-display text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted shadow-e1">
                  {category}
                </h2>
                <span className="inline-flex items-center rounded-full border border-slate-200/80 bg-white/90 px-2 py-0.5 text-[10px] font-medium tabular-nums text-ink-subtle shadow-e1">
                  {items.length} tools
                </span>
              </div>
              <ul className="grid gap-2.5 sm:grid-cols-2">
                {items.map((tool) => (
                  <li key={tool.slug}>
                    <ToolTile tool={tool} />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

function ToolTile({ tool }: { tool: ToolDef }) {
  const Icon = tool.icon;
  const isAvailable = tool.status === 'available';

  const body = (
    <>
      <span
        className={[
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition duration-fast',
          isAvailable
            ? 'bg-teal-50 text-teal-700 ring-1 ring-inset ring-teal-100 group-hover/tile:bg-teal-100 group-hover/tile:ring-teal-200'
            : 'bg-slate-100 text-slate-400',
        ].join(' ')}
      >
        <Icon className="h-5 w-5" weight="duotone" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-display text-[15px] font-semibold leading-tight text-slate-900">{tool.name}</span>
        <span className="mt-0.5 block truncate text-xs text-slate-500">{tool.tagline ?? tool.summary}</span>
      </span>
      <span className="flex shrink-0 items-center gap-2 self-center">
        {isAvailable && tool.beta && <BetaTag />}
        {!isAvailable && (
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-500 ring-1 ring-inset ring-slate-200">
            Planned
          </span>
        )}
        {isAvailable && (
          <ArrowRightIcon className="h-4 w-4 text-slate-300 transition duration-fast group-hover/tile:translate-x-0.5 group-hover/tile:text-teal-600" />
        )}
      </span>
    </>
  );

  const cls =
    'group/tile flex h-full items-center gap-3 rounded-xl border bg-white p-3 shadow-e1 transition duration-fast ease-out';

  return isAvailable ? (
    <Link
      to={`/tools/${tool.slug}`}
      title={tool.summary}
      className={`${cls} border-slate-200 hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-e2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas`}
    >
      {body}
    </Link>
  ) : (
    <div aria-disabled="true" className={`${cls} border-dashed border-slate-300 bg-white/60`}>
      {body}
    </div>
  );
}
