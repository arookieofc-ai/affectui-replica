# Logo Marquee — REPORT

## What built
Standalone `index.html` (33KB, inline CSS+JS, system fonts only) replicating affectUI **Logo Marquee** (`logo-marquee`, Social proof): “Endless trusted-by logo strip looping seamlessly, pausing and colouring on hover.”

- Caption `Trusted by teams at` + region `Companies that use the product`, default `rows=2, speed=36, labels=beside, gap=56, pauseOnHover=true, grayscale=true` — same as demo (`demo-original.js` function `d`).
- Demo data verbatim (10 logos, order preserved): Vercel (scale .86), Linear (#5E6AD2), Notion, Stripe (#635BFF, .96), Figma (#F24E1E), Slack (#E01E5A, .92, 4 paths), GitHub (.96), Shopify (#1e8a4f), Spotify (#3fb670, .94), Airbnb (#FF5A5F). SVG `viewBox` + `path d` strings copied verbatim from `demo-original.js`; no invented logos.
- Clean-room: own class names (`.lm*`), own rAF loop, own drag/inertia/keyboard code. No copied bundle code.
- Interactions: seamless wrap (modulo), velocity smoothing, hover/focus pause, hover brand-colour lift, drag-to-scrub with fling + click suppression, ArrowLeft/Right nudge (±160), controls for speed/direction/rows/gap/labels/pause/grayscale, reduced-motion static wrap, edge fade mask, focus-visible rings, responsive 22px marks under 520px container.

## What matches original
- Layout: centred caption + two opposite-direction rows (even/odd split), gap-on-right so one set width = wrap distance, duplicated sets (ceil(viewport/set)+1, 2–6).
- Visual: 28px marks, muted #9a9a9a → ink on hover, brand colour via `--lm-brand`, tile fallback, ellipsis names, 260ms→200ms ease, dim .75, fade `min(14%,120px)`, grab/grabbing cursor, `touch-action:pan-y`.
- Behaviour: pause on hover/focus, colour on hover, no colour flicker while dragging, keyboard seek, ResizeObserver copy count, IntersectionObserver + visibility pause.

## What could not verify (no browser per task)
- Pixel-perfect mask/kerning vs original screenshots; sub-pixel smoothing curves.
- Real pointer drag feel, touch scrub, screen-reader announcement order.
- `color-mix` tile background in older browsers (graceful fallback: transparent).

## How to test
- Open `index.html` in a browser. Hover a logo → strip pauses, logo colours. Drag a row → scrub + fling. Change controls. Toggle sun/moon.
- Node only (per task): `node --check main.check.js` (extracted main script) + `node harness.js` — asserts visible painted text, full-loop node identity, zero innerHTML writes after init, light+dark themes. Result: 41 passed, 0 failed.

## Themes
Checked both: light (`--surface #ffffff`, `--page #fafaf9`, ink #171717) and dark (`#1c1c1f`/`#101012`, ink #ededed, amber adjusted) via `data-theme` toggle + `/*noflash*/` guard + `meta color-scheme`. Noflash style prevents white first-frame in dark.
