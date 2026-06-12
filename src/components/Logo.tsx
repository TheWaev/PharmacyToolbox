/**
 * ClinicalPharmTools brand mark: a two-tone capsule (pill) crossed with a
 * box-end spanner — "clinical pharmacy tools". Self-contained (includes its own
 * rounded teal tile) so it works in the header and as a favicon.
 */
export default function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} role="img" aria-label="ClinicalPharmTools logo">
      <defs>
        <linearGradient id="cpt-logo-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#14b8a6" />
          <stop offset="1" stopColor="#0891b2" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="13" fill="url(#cpt-logo-g)" />
      {/* Spanner along "\" — hexagon box-end head (upper-left) + handle */}
      <g transform="rotate(45 24 24)">
        <rect x="16" y="21" width="24" height="6" rx="3" fill="#fff" />
        <path
          fill="#fff"
          fillRule="evenodd"
          d="M 19 24 L 15.5 30.06 L 8.5 30.06 L 5 24 L 8.5 17.94 L 15.5 17.94 Z
             M 15 24 L 13.25 27.03 L 9.75 27.03 L 8 24 L 9.75 20.97 L 13.25 20.97 Z"
        />
      </g>
      {/* Capsule along "/" — crosses on top, with seam + thin separating outline */}
      <g transform="rotate(-45 24 24)">
        <rect x="11" y="20" width="26" height="8" rx="4" fill="#fff" stroke="#0d9488" strokeWidth="2.2" />
        <line x1="24" y1="20" x2="24" y2="28" stroke="#0d9488" strokeWidth="2.2" strokeLinecap="round" />
      </g>
    </svg>
  );
}
