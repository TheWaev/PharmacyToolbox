import { Link } from 'react-router-dom';
import { PillIcon } from './icons';

export default function Header() {
  return (
    <header className="no-print sticky top-0 z-20 border-b border-slate-200/70 bg-white/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
        <Link to="/" className="group flex items-center gap-3 rounded-lg">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 text-white shadow-sm shadow-teal-600/20 transition group-hover:scale-105">
            <PillIcon className="h-5 w-5" weight="bold" />
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-base font-semibold tracking-tight text-slate-900">
              ClinicalPharmTools
            </span>
            <span className="text-xs text-slate-500">clinical pharmacy calculators</span>
          </span>
        </Link>
        <nav aria-label="Primary">
          <Link
            to="/"
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
          >
            All tools
          </Link>
        </nav>
      </div>
    </header>
  );
}
