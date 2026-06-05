import { AlertIcon } from './icons';

/**
 * Persistent clinical disclaimer + information-governance reminder (PRD §7).
 * Rendered in the footer on every page so it is always visible.
 */
export default function Disclaimer() {
  return (
    <div
      role="note"
      className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50/70 p-4 text-sm text-amber-900"
    >
      <AlertIcon className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" weight="fill" />
      <div className="space-y-2">
        <div>
          <p className="font-semibold">Clinical disclaimer</p>
          <p className="mt-0.5 text-amber-800">
            This is a calculation aid only. All quantities must be clinically reviewed; the final
            prescribing decision rests with the prescriber. It does not account for clinical
            factors, interactions, titration or dose changes.
          </p>
        </div>
        <div>
          <p className="font-semibold">Do not enter patient-identifiable data</p>
          <p className="mt-0.5 text-amber-800">
            Do not type patient names, NHS numbers, dates of birth or any other identifiers into
            this tool.
          </p>
        </div>
      </div>
    </div>
  );
}
