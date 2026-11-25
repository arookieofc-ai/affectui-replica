# Plan vs Actual — replica report

## What was built
`index.html` (47.6 KB, single self-contained file, no network, no external assets,
system font stack) replicating the affectUI **Plan vs actual** component from
`demo-original.js`. All code is clean-room: layout/behaviour re-implemented from
observed demo behaviour, no compiled source copied.

- **Header**: mark icon + `Plan vs actual` title + task `Ship the pricing page`,
  live `Time` stat (`elapsed / plan`), live `Cost` stat (`spent / plan`), and a
  verdict pill (`On plan` / `+Xs late|behind` / `Xs early|ahead`).
- **Timeline**: one row per step with status icon (check / spinner / dashed circle),
  step name, planned ghost bar (dashed), actual bar (purple), over-plan tail
  (orange), remaining-forecast segment while running, and an inline tag showing
  elapsed + diff pill (`+Ns` orange / `−Ns` green, U+2212 minus as in the original)
  + growing cost. Dependency elbow links, grid ticks with `M:SS` labels, dashed
  `Plan M:SS` finish flag, solid moving `ETA`/`Done M:SS` flag, and a now-line dot.
- **Behaviour**: 10x demo clock throttled to ~30 fps, steps start with a 1 s handoff
  gap chained off actual durations, costs accrue proportionally while running,
  ~4 s hold on the finished state, then the loop restarts. Overrun threshold
  1500 ms, tick sizing (`30 s`/`60 s`→up) and `range × 1.22` match the original.
- **Interactions**: hover/focus highlights the dependency chain (attribute-only, no
  re-render); click / Enter / Space on a row opens a detail dialog (planned vs
  actual vs diff vs cost, deps) on `pointerdown` capture; Esc/scrim/Close dismisses
  with focus return. Rows are keyboard-focusable with `aria-label`s; narrow
  (<560 px) layout stacks with wrapped stats and hidden finish flags.
- **Themes**: full CSS-variable token set; visible sun/moon toggle top-right flips
  `data-theme="light"|"dark"` (persisted). Default is the original demo's
  appearance (light); OS dark preference is honoured only when no stored choice
  exists. Dark redefines every component token (amber waiting adjusted for dark).

## Original data/behaviour matched (verbatim, not generic)
All 7 steps with exact titles, plans, planCosts, deps, durations and spend:
Read the brief (20 s/.04, 16 s/.03) → Draft the copy (40 s/.18, 52 s/.23) →
Build the layout (60 s/.32, 85 s/.47) → Write the tests (30 s/.10, 28 s/.09) →
Wire up Stripe (45 s/.16, 38 s/.14) → Run tests and fix (35 s/.20, 55 s/.31) →
Open the pull request (15 s/.03, 14 s/.03). End state verified: verdict
`+37s late`, totals `3:32` actual vs `2:55` plan, `$1.30` spent vs `$1.03` planned.

## Verification (all in-directory, no installs)
- `node --check` on the extracted page script: **passes**.
- `node verify-harness.cjs` (DOM-stub harness, 63 assertions): **ALL PASS**. It
  loads the real page script, drives `setClock` through the full loop
  (t=0 → mid → `loopEnd` → restart), and asserts **visible** text/state:
  step names, `0:00`, `+3s` overrun pill, `+37s late`, `$1.30`/`$1.03`,
  `2:55`, all-done then running-again, same row-node identities across ticks
  (no DOM rebuild in the fast loop), hover attribute-only highlighting,
  dialog open/close + Enter-to-open, theme toggle both directions.
- CSS audit: no top-level rule sets `display:none` / `visibility:hidden` /
  `color:transparent` / `font-size:0` on component text; `[hidden]{display:none}`
  guard present; spinner SVG classed via `setAttribute`; `pointerdown` capture
  and 560 px responsive rules present; no external URLs; system fonts.
- **Light AND dark checked**: exact token values asserted for both themes;
  ink/surface contrast 17.5 (light) / 14.5 (dark), muted/surface 4.8 / 6.6.

## How to test
Open `index.html` in a browser (or `node verify-harness.cjs` in this directory).
Toggle the theme button top-right to compare light/dark; watch one ~25 s loop;
click any step row for details.

## Not verified
Pixel-perfect match to the proprietary rendered original (no screenshot harness
here); smoothing of waiting-bar estimates is positional-direct rather than
exponentially interpolated — visually equivalent at 10x speed.
