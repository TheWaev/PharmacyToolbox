/** @type {import('tailwindcss').Config} */
const withAlpha = (v) => `rgb(var(${v}) / <alpha-value>)`;

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      // Token-driven colours (added alongside Tailwind defaults so existing
      // slate/teal utilities keep working while components migrate to tokens).
      colors: {
        // The app's components currently use `teal-*` utilities directly, so we
        // remap the teal scale to forest green to rebrand everything at once
        // (until components migrate to the brand-* tokens in stage B).
        teal: {
          50: '#f0f6f2',
          100: '#daece0',
          200: '#b5d7c0',
          300: '#84bc99',
          400: '#4f9a6e',
          500: '#2d7c54',
          600: '#1f6543',
          700: '#195237',
          800: '#16402d',
          900: '#113023',
        },
        brand: {
          50: withAlpha('--brand-50'),
          100: withAlpha('--brand-100'),
          200: withAlpha('--brand-200'),
          300: withAlpha('--brand-300'),
          400: withAlpha('--brand-400'),
          500: withAlpha('--brand-500'),
          600: withAlpha('--brand-600'),
          700: withAlpha('--brand-700'),
          800: withAlpha('--brand-800'),
          900: withAlpha('--brand-900'),
        },
        ink: {
          DEFAULT: withAlpha('--ink'),
          muted: withAlpha('--ink-muted'),
          subtle: withAlpha('--ink-subtle'),
        },
        canvas: withAlpha('--bg'),
        surface: {
          DEFAULT: withAlpha('--surface'),
          inset: withAlpha('--surface-inset'),
        },
        hairline: {
          DEFAULT: withAlpha('--border'),
          strong: withAlpha('--border-strong'),
        },
        success: { DEFAULT: withAlpha('--success'), bg: withAlpha('--success-bg'), border: withAlpha('--success-border') },
        warn: { DEFAULT: withAlpha('--warn'), bg: withAlpha('--warn-bg'), border: withAlpha('--warn-border') },
        danger: { DEFAULT: withAlpha('--danger'), bg: withAlpha('--danger-bg'), border: withAlpha('--danger-border') },
        info: withAlpha('--info'),
      },
      fontFamily: {
        // Atkinson Hyperlegible Next is the body / UI / number face
        // (legibility-first); Bricolage Grotesque is the display / title face.
        sans: [
          'Atkinson Hyperlegible Next',
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
        // Display / title face for headings, the wordmark and tool titles.
        display: [
          'Bricolage Grotesque',
          'Atkinson Hyperlegible Next',
          'ui-sans-serif',
          'system-ui',
          'sans-serif',
        ],
        // Legible-numeral stack for dense numeric output.
        num: [
          'Atkinson Hyperlegible Next',
          'Inter',
          'ui-sans-serif',
          'system-ui',
          'sans-serif',
        ],
      },
      boxShadow: {
        e1: 'var(--shadow-1)',
        e2: 'var(--shadow-2)',
        e3: 'var(--shadow-3)',
        // Keep the legacy `card` name pointing at the new layered elevation so
        // existing `shadow-card` usages upgrade for free.
        card: 'var(--shadow-2)',
      },
      transitionDuration: {
        fast: '150ms',
        slow: '250ms',
      },
      transitionTimingFunction: {
        brand: 'cubic-bezier(0.2, 0.6, 0.2, 1)',
      },
      // Mild heading tightening that suits Bricolage Grotesque without
      // squashing the letters.
      letterSpacing: {
        tight: '-0.02em',
        tighter: '-0.035em',
      },
    },
  },
  plugins: [],
};
