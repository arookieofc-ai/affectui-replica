# KPI Chart — replica report

## What was built
`index.html` (17.9KB, self-contained, no network, system fonts only) replicates the
affectUI **KPI Chart** demo: metric card with multi-line chart and pointer-following tooltip.

Page wrapper: `Analytics / Revenue` header with meta `5 channels · Mar 3 – Mar 9 · $96.4k total`
plus a visible sun/moon theme toggle (top-right). Card matches the original:
title `Revenue`, value `$96.4k`, delta `+$7.9k` (up/green), y-axis `$6.0k / $3.0k / $0`,
x-axis `Mar 3 / Mar 6 / Mar 9`, 5 colored lines, guide + dots, tooltip with date +
per-channel values sorted descending, footer `Top 5 channels`.

## Matched data / behaviour (verbatim from demo-original.js)
- Labels: `Mar 3..Mar 9`; tooltip labels `Mon, Mar 3..Sun, Mar 9`.
- Series + colors + values verbatim:
  - Organic `#4fb0fe` [4200,4700,3900,4600,5400,5100,5900]
  - Paid ads `#ee3e9e` [3600,3300,4400,4800,4000,4500,4200]
  - Referral `#a651f0` [1800,2300,2000,1500,2400,2200,2700]
  - Email `#13b3a0` [1200,1100,1700,2100,1600,1300,1500]
  - Direct `#a3a3a3` [600,900,700,800,1000,1400,1100]
- Format `$X.Xk` / `$N` (e.g. delta `+$7.9k`), nice-max ceiling 6000, y `% = (6000-v)/6000`,
  x `% = i/6*100`, path `M/L` segments, no isolated single-point dots.
- Interactions: `pointermove` + `pointerdown` set index, `pointerleave`/`blur` close,
  `ArrowRight/ArrowLeft/Escape` keyboard on focusable plot (`role=group`,
  `aria-label`, `aria-live=polite` tooltip), tooltip side right (≤50%) / left (>50%)
  with edge nudge clamp, rows re-sorted descending per index.
- Styles: 1px border + soft shadow, 20px/12px radii, 150–220ms ease, draw 1100ms +
  focus-visible outline, hover lift, reduced-motion off, responsive narrow stacking.

## Structure / hard rules followed
- Design tokens for every colour (`--page/--surface/--ink/--muted/--subtle/--border`,
  dark variants, amber kept). Default appearance = original (light).
- `/*noflash*/` guard first in `<head>`: reads `kpi-theme` else `prefers-color-scheme`,
  sets `data-theme` before paint; inline `html{background:#fafaf9}html[data-theme=dark]{background:#101012}`
  + `meta color-scheme`. No white flash on dark.
- In-place updates only: DOM built once as static markup; JS queries nodes once and
  updates `textContent`/`style`/`setAttribute`/`appendChild` (reorder). No `innerHTML`
  anywhere in the component script. SVG `d`/`stroke` via `setAttribute` only.
  Hover/focus never re-renders. `[hidden]{display:none!important}` included.
- No agent identities in this component, so no pixel-marks (spec: only if agents exist).
- Clean-room code; no copied bundle source.

## Verification (node only, no browser)
- `node --check` on extracted component script: OK.
- In-dir stub harness `verify.cjs`: loads `index.html`, extracts scripts, runs component
  script against a DOM stub, drives pointer through full 7-day loop (asserts date,
  top-row label/value, side, open state per index), leave/Escape close, Arrow keys,
  `pointerdown` open, theme toggle light→dark→light, node identity for 5 rows / 5 dots /
  5 paths, zero `innerHTML` writes after init. Result: `ALL CHECKS PASSED`.
- Light AND dark checked: static token audit (page `#fafaf9` / `#101012`, surface
  `#ffffff` / `#1c1c1f`, ink `#171717` / `#ededed`) + toggle flip both directions in harness.
- No package installs/downloads.

## How to test
Open `index.html` in a browser. Hover/scrub the chart, click/touch, tab-focus + arrow keys,
toggle sun/moon. No server needed.
