/** @type {import('tailwindcss').Config} */

// Colours follow the LOF Student Hub style guide and switch with
// data-theme="light" | "dark" on <html>. Values live in src/styles/palette.css;
// this file only maps Tailwind's colour names onto those variables.
const SHADES = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

// Tailwind palette name -> LOF brand family.
const FAMILIES = {
  slate: 'neutral', gray: 'neutral', zinc: 'neutral', neutral: 'neutral', stone: 'neutral',
  indigo: 'navy', blue: 'navy', violet: 'navy', purple: 'navy', sky: 'navy', cyan: 'navy',
  red: 'red', rose: 'red', pink: 'red', fuchsia: 'red',
  amber: 'amber', yellow: 'amber', orange: 'amber',
  green: 'green', emerald: 'green', teal: 'green', lime: 'green',
};

// Semantic names from the guide: bg-canvas, bg-panel, text-heading, border-line ...
const SEMANTIC = [
  'canvas', 'panel', 'subtle', 'line', 'line-strong', 'ink', 'ink-2', 'muted', 'faint',
  'heading', 'link', 'track', 'brand', 'brand-700', 'brand-text', 'navy', 'navy-700', 'navy-900',
];

const rgb = (name) => `rgb(var(--${name}) / <alpha-value>)`;

// role: bg (fills, gradients), tx (text, icons), bd (borders, rings, dividers)
function palette(role) {
  const colors = {
    transparent: 'transparent',
    current: 'currentColor',
    inherit: 'inherit',
    black: '#000000',
    // A white *fill* is a surface, so it follows the theme; white text and
    // borders stay white (they sit on red buttons and dark panes).
    white: role === 'bg' ? rgb('bg-white') : '#ffffff',
  };
  for (const [name, family] of Object.entries(FAMILIES)) {
    colors[name] = Object.fromEntries(SHADES.map((s) => [s, rgb(`${role}-${family}-${s}`)]));
  }
  for (const name of SEMANTIC) colors[name] = rgb(`c-${name}`);
  // Legacy names used across the app, now pointing at the guide's colours.
  colors.background = rgb('c-canvas');
  colors.surface = rgb('c-panel');
  colors.primary = { start: rgb('c-brand'), end: rgb('c-brand-700') };
  return colors;
}

const bg = palette('bg');
const tx = palette('tx');
const bd = palette('bd');

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    colors: tx,
    backgroundColor: bg,
    gradientColorStops: bg,
    textColor: tx,
    placeholderColor: tx,
    fill: tx,
    stroke: tx,
    caretColor: tx,
    accentColor: tx,
    textDecorationColor: tx,
    borderColor: { ...bd, DEFAULT: rgb('c-line') },
    divideColor: bd,
    ringColor: { ...bd, DEFAULT: bd.red[500] },
    ringOffsetColor: bg,
    outlineColor: bd,
    boxShadowColor: bd,
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', '"Segoe UI"', 'sans-serif'],
        // The guide uses one family; headings differ by weight and tracking only.
        heading: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', '"Segoe UI"', 'sans-serif'],
      },
      fontWeight: { 550: '550', 650: '650', 750: '750' },
      borderRadius: {
        'lof-xs': '6px', 'lof-sm': '8px', lof: '12px', 'lof-modal': '14px', 'lof-hero': '16px',
      },
      boxShadow: {
        glow: 'var(--shadow-press)',
        'lof-sm': 'var(--shadow-sm)',
        lof: 'var(--shadow)',
        'lof-lift': 'var(--shadow-lift)',
        'lof-nudge': 'var(--shadow-nudge)',
        'lof-press': 'var(--shadow-press)',
      },
      transitionTimingFunction: {
        expo: 'cubic-bezier(.16, 1, .3, 1)',
        lof: 'cubic-bezier(.2, .7, .2, 1)',
      },
    },
  },
  plugins: [],
};
