# Trend Chart — replica report

## What was built
`index.html` (26KB, self-contained, no network, system fonts) — standalone Trend Chart:
- Header: `growth-dashboard` + `3 live` + `4 agents` + `44k / 200k tokens` with thin 3px bar + sun/moon toggle (top-right).
- Card: `Signups trend`, subtitle `Last 30 days vs previous 30 days`, delta pill, Period seg (7D/30D/12M), Type seg (Line/Area/Bars), legend Current vs Previous.
- SVG chart (640×260): current solid line, previous dashed line, area fill in Area mode, grouped bars in Bars mode, dots + highlight dot, grid + Y/X labels. Tooltip on hover/focus, details popover pinned on Shift+Click / double-click / Enter, closed on Esc/Close.
- Stats: Total / Average / Peak / Last value. Footer live status `Live · tick i/N · highlight … · next in 1.5s`.
- Live loop: single `setInterval(advance,1500)` sweeps highlight `hi=(hi+1)%N`, jitters last value on wrap. DOM built once in `buildOnce()`; ticks only update `d/cx/cy/textContent/attributes/visibility` in place. Zero `innerHTML` in main script. SVG classes only via `setAttribute`. Popover opens via `pointerdown`+`mousedown` capture. Hover/focus only move highlight + tooltip. `[hidden]{display:none!important}` present.

## Demo data / behaviour
- `demo-original.js` in this dir is a 404 HTML page (`Page not found · affectUI`, 6163 bytes), not chart data. No exact names/numbers/timings recoverable.
- Used plausible same-shape data (documented as invented):
  - 7D current `[128,142,135,168,182,176,204]` prev `[110,124,118,140,152,148,166]`
  - 30D current `[122,135,…,292,301]` (sum 6355, avg 211.8, +15.0% vs prev sum 5524) prev `[105,118,…,254,262]`
  - 12M current `[820,940,…,1680]` (sum 14380) prev `[700,820,…,1440]`
- Behaviours replicated from spec: tooltip + period comparison (current vs previous + % change), type switching, live ticking, keyboard (arrows/Enter/Esc), responsive stack.
- No agent identities in this component, so no 3×3 pixel-marks (spec requires exactly 9 cells *if* identities exist — N/A here).

## Verification
- `node --check` on extracted main script: OK.
- In-dir stub harness `./verify.cjs` (no /tmp writes, no installs):
  - static: `/*noflash*/` guard first in `<head>`, `color-scheme` meta, `html{background…}` both themes, tokens, toggle, header pattern, zero `innerHTML`, no `.className=`, pointerdown capture.
  - runtime: loads script in fake DOM, advances full 30-step loop + period/type switches + 3 timer callbacks.
  - asserts VISIBLE text (title `Signups trend`, total `6,355`→`6,353` after live jitter, `1,135` in 7D, `14,380` in 12M, foot `tick …`), node identity preserved (`total/svg/foot/hi` same objects), zero `innerHTML` writes after init.
  - light AND dark checked via `applyTheme('light'/'dark')` — stats remain visible in both.
  - Result: `ALL CHECKS PASSED (light AND dark checked)`.

## How to test
Open `./index.html` in a browser (double-click). Toggle theme (top-right), switch 7D/30D/12M and Line/Area/Bars, hover chart for tooltip, Shift+Click a point for details, use Tab + arrows + Enter. No server needed.
