/** @type {import('tailwindcss').Config} */
const withAlpha = (v) => `rgb(var(${v}) / <alpha-value>)`;

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      // Token-driven colours (added alongside Tailwind defaults so existing
      // slate/teal utilities keep working while components migrate to tokens).
      colors: {
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
        sans: [
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
    },
  },
  plugins: [],
};
