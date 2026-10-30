import { useId, useMemo } from 'react';
import { asset } from '../lib/asset';

/*
 * Space artwork from the LOF Student Hub style guide.
 *
 * HeroSky        - stars, a rocket stencil and a dotted orbit with a red satellite,
 *                  for dark navy hero banners. The only ambient motion in the app
 *                  (90s star drift, 18s orbit), as the guide allows.
 * PageWatermarks - faint, static solar system behind the page, plus the
 *                  head mark as a 4% watermark in the bottom-right corner.
 * All decorative: aria-hidden and pointer-events: none.
 */

// Line-art rocket, drawn on a 120 x 200 grid with currentColor strokes.
function RocketOutline(props) {
  return (
    <svg viewBox="0 0 120 200" fill="none" stroke="currentColor" strokeWidth="3"
      strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M60 8 C80 30 88 62 88 100 L88 148 L32 148 L32 100 C32 62 40 30 60 8 Z" />
      <circle cx="60" cy="74" r="13" />
      <path d="M32 112 L12 142 L12 170 L32 156" />
      <path d="M88 112 L108 142 L108 170 L88 156" />
      <path d="M45 148 L42 168 L78 168 L75 148" />
      <path d="M52 176 L50 192 M60 176 L60 196 M68 176 L70 192" />
    </svg>
  );
}

// Sun with three dotted orbits and their planets.
function SolarSystem(props) {
  return (
    <svg viewBox="0 0 400 400" fill="none" stroke="currentColor" strokeLinecap="round" {...props}>
      <circle cx="200" cy="200" r="34" strokeWidth="2.5" />
      <circle cx="200" cy="200" r="86" strokeWidth="1.5" strokeDasharray="2 7" />
      <circle cx="200" cy="200" r="138" strokeWidth="1.5" strokeDasharray="2 7" />
      <circle cx="200" cy="200" r="190" strokeWidth="1.5" strokeDasharray="2 7" />
      <circle cx="261" cy="139" r="9" strokeWidth="2.5" />
      <circle cx="80" cy="268" r="14" strokeWidth="2.5" />
      <ellipse cx="80" cy="268" rx="26" ry="7" strokeWidth="2" transform="rotate(-20 80 268)" />
      <circle cx="334" cy="292" r="7" strokeWidth="2.5" />
    </svg>
  );
}

// Box-shadow star field, like the guide's hero preview.
function starField(count, maxSpread) {
  const stars = [];
  for (let i = 0; i < count; i += 1) {
    const x = Math.round(Math.random() * 2400);
    const y = Math.round(Math.random() * 420);
    const spread = Math.random() < 0.15 ? maxSpread : 0;
    const alpha = (Math.random() * 0.5 + 0.25).toFixed(2);
    stars.push(`${x}px ${y}px 0 ${spread}px rgba(255,255,255,${alpha})`);
  }
  return stars.join(',');
}

/**
 * Decoration for a dark hero banner. Put it as the first child of a
 * `relative overflow-hidden` container and give the content `relative z-[1]`.
 * rocket={false} keeps only the stars and the orbit (e.g. over photos).
 */
export function HeroSky({ rocket = true }) {
  const far = useMemo(() => starField(70, 0.5), []);
  const near = useMemo(() => starField(40, 1), []);
  // unique per banner, so two heroes on one page each orbit their own path
  const pathId = `lof-orbit-${useId().replace(/:/g, '')}`;
  return (
    <div className="hero-sky" aria-hidden="true">
      <div className="hero-stars far" style={{ boxShadow: far }} />
      <div className="hero-stars" style={{ boxShadow: near }} />
      {rocket && <RocketOutline className="hero-rocket" />}
      <svg className="hero-orbit" viewBox="0 0 420 220">
        <circle className="planet" cx="250" cy="110" r="38" />
        <ellipse id={pathId} className="path" cx="250" cy="110" rx="170" ry="62" transform="rotate(-12 250 110)" />
        <g>
          <circle className="sat-halo" r="7" />
          <circle className="sat" r="3.2" />
          <animateMotion dur="18s" repeatCount="indefinite" rotate="auto">
            <mpath href={`#${pathId}`} />
          </animateMotion>
        </g>
      </svg>
    </div>
  );
}

/**
 * Background art for a page: fixed behind <main> by default, or `contained`
 * (absolute) inside a full-screen panel that covers the page background.
 */
export function PageWatermarks({ contained = false }) {
  return (
    <div className={`page-watermarks${contained ? ' contained' : ''}`} aria-hidden="true">
      <SolarSystem className="wm-solar" />
      <div className="wm-mark" style={{ '--mark-url': `url(${asset('lof-mark.png')})` }} />
    </div>
  );
}
