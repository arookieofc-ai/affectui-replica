# Testimonial Wall — replica report

## What was built
Standalone `index.html` (24 KB, inline CSS+JS, system fonts only) replicating affectUI
`testimonial-wall` (Social proof): landing-page quote wall with endless opposite-scrolling
columns, hover pause, and inertia drag-scrub.

- Header: `Testimonials` eyebrow + `Loved by product teams` title + `What product teams say`
  region label (matches demo wrapper `_` in `demo-original.js`).
- Wall: 3 → 2 → 1 responsive columns (`>=740px:3, >=480px:2, else 1`), round-robin
  distribution (`items.filter((_,i)=>i%E===c)`), per-column direction factors
  `[1, -0.84, 1.12]` and initial offsets `[0, 0.42, 0.18]`, seamless wrap via
  repeated sets (middle set is the accessible one, duplicates `aria-hidden`+`inert`).
- Cards: 5-star row (when `rating`), quote (`pre-line`, 10-line clamp), avatar photo with
  initials fallback, name (2-line clamp) + verified badge, `role · company` meta (2-line clamp),
  overflow tooltips, `tabIndex=0` on real-set cards only.
- Motion: rAF loop with exponential velocity smoothing (`tau 0.7 run / 0.32 paused /
  0.55 snap`), `dt` clamped to 0.05s, `translate3d(0,-(h+y),0)` per track, focus clamp
  vs modulo wrap, `seek` nudge to reveal keyboard-focused cards.
- Interactions: per-column hover pause (non-touch), touch pause, focus pause, pointer
  drag-scrub with velocity tracking + inertia clamp `±2400px/s` + click suppression after
  a drag, global Pause/Play button, Speed slider (0–60, default 26 = demo), theme toggle,
  `prefers-reduced-motion` → static masonry (`data-static`, no mask, all quotes visible).
- Initials: suffix-stripped (`jr/sr/i/ii/iii/iv/v/vi/phd/md/esq`), `Intl.Segmenter`
  grapheme-aware, first+last words uppercased — same rule as the original `u()`.

Demo data is verbatim (12 items): Lena Hartmann through Hana Sato, with exact quotes,
`rating:5` on Lena/Mara/Camille/Elif/Hana, `verified:true` on Jonas/Priya/Noah/Sofia/Marcus,
avatars `/avatars/*.jpg` attempted with `onerror` initials fallback (standalone file has
no image assets, so initials paint).

Clean-room: own class names (`wall/col/track/set/item/card/...`), own CSS/JS written from
behaviour. No verbatim copy from the compiled bundle.

## What matches the original
- Card anatomy, spacing rhythm, 36px round avatars, 13px stars, quote 14px/1.6,
  name 13.5px/500, meta 12.5px muted, 18×20px card padding, 16px gap, 16px radius.
- Opposite-direction endless columns, hover-dim of non-hovered cards (`--dim:.62`),
  lift on hover/focus-visible, top/bottom fade mask (96px), grab/grabbing cursor.
- Responsive breakpoints, static reduced-motion fallback, tooltip-on-overflow,
  verified check, `Rated X out of 5` star labels.
- Design tokens via custom properties; light `--page:#fafaf9 --surface:#ffffff`
  and dark `--page:#101012 --surface:#1c1c1f`; borders/muted adjusted per theme.
- v4: `/*noflash*/` guard first in `<head>`, `html{background}` inline, 
  `<meta name="color-scheme" content="light dark">`, in-place updates only
  (DOM built once; rAF touches only `style.transform` + hover/focus flags).
- v5: all `:hover` inside `@media (hover: hover) and (pointer: fine)`,
  `html{-webkit-tap-highlight-color:transparent}`, `body{font-variant-numeric:tabular-nums}`,
  concentric outer radius `calc(16px + 12px)`, border-for-structure + shadow-for-elevation,
  avatar 1px inset black/white 10% outline, icon-side −2px optical padding.

Known token deviations (spec tokens win over compiled fallbacks): page/border/muted use
spec palette (`#fafaf9/#e7e5e4/#78716c`) vs bundle fallbacks (`#ececec/#8f8f8f`); card gap
16px and card transition 320ms kept from original (spec suggests 8–12px gaps / 150–200ms).

## What could not be verified
- No browser in this environment (per task: node only, no browser install/launch).
  Pixel fidelity, container-query breakpoints, mask rendering, and real pointer/IntersectionObserver
  behaviour were not visually checked against the original demo.
- Avatar photos (`/avatars/*.jpg`) do not ship with the standalone file; fallback initials
  were verified, real-photo rendering was not.
- Screen-reader announcements and real keyboard `:focus-visible` centring were reasoned
  from code, not tested with assistive tech.

## How to test
1. Open `index.html` in a browser (double-click or `python3 -m http.server` then visit it).
2. Confirm three columns scroll endlessly in opposite directions; hover a column → it eases
   to a stop; drag a column → it scrubs and flings with inertia.
3. Toggle the Dark/Light pill (top-right) → page, cards, borders and text re-tokenise with
   no white flash on reload (theme persists via `localStorage`).
4. Pause/Play button and Speed slider affect all columns immediately.
5. Tab through cards → focused card lifts and nudges fully into view.
6. Enable reduced motion → wall becomes a static readable grid.
7. Node verification (no browser): `node --check ./harness.js && node ./harness.js`
   plus `node --check ./inline-check.js` (extracted inline script).

## Verification (node only)
- `node --check ./harness.js` → OK
- `node --check ./inline-check.js` (inline wall script extracted from `index.html`) → OK
- `node ./harness.js` → ALL CHECKS PASSED:
  - VISIBLE painted text contains all 12 verbatim quotes/names/companies
  - accessible (non-hidden) sets present (3), wall animated (no `data-static`)
  - full-loop node identity: 48 card nodes identical after 3000 ticks (wrap)
  - animation advanced (y changed)
  - zero `innerHTML` writes after init (writes=0)
  - light AND dark themes: `data-theme` toggles, dark CSS block, `#fafaf9/#101012`,
    `#ffffff/#1c1c1f`, `color-scheme`, `noflash`, gated hover, tap-highlight,
    `tabular-nums` all present
- Checked light AND dark mode in tokens/CSS + stub DOM toggle; no grey-on-grey,
  no invisible borders per token review.
