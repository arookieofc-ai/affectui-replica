# Agent / Usage replica — REPORT

## What was built
- `index.html` (33KB, self-contained, no external deps): standalone "Usage / November" page.
  - Header: `Usage` + `November` + sun/moon theme toggle (top-right).
  - Spend card: "Spent in November", big live total, `of €500 · 54%`, status line
    (`On track for €427 by Nov 30`), cumulative SVG chart with forecast dash,
    budget dash, pulse dot, day ticks, hover/keyboard tooltip, stats row
    (Tasks 186 / Runs / Per task / Tokens).
  - "Where it went" with Projects|Models segmented control; rows show colour
    mark, name, bar, amount, share %, vs-last-month delta, chevron. Clicking a
    row selects it in place.
  - Detail panel for the selected group: amount, share, delta, 30 day-by-day
    bars (future days dimmed), readable range line, "What cost the most" task
    list (title + runs + cost).
  - "Worth a look" notes (3 verbatim notes with icon, badge, Open button;
    Open selects the related project).
  - Live ticking every 3400ms cycling the 5 demo feed events
    (Ingest pipeline +€0.42, Support triage +€0.06, Benchmark suite +€1.84,
    Client dashboard +€0.67, Billing webhooks +€0.35), updating days, project
    + model amounts, runs (+1), tokens (+cost×180k), and a transient flash pill.
- `harness.js`: in-dir DOM-stub harness (no browser, no network).
- `node-check-target.js`: extracted app script used for `node --check`.

## Demo data (verbatim from demo-original.js)
- Projects: Northwind 118.4 (last 96.2) / Platform 82.1 (88) / Evalkit 46.3 (22.9) /
  Internal 23.6 (30.1), with the exact task titles/runs/costs.
- Models: Claude Opus 5.5 141.2 / Claude Sonnet 5.5 96.8 / Claude Haiku 5.5 18.9 /
  Embeddings 13.5, with exact sub-tasks.
- Notes (3), stats (186 tasks, 1284 runs, 48.2M tokens), budget €500, 19-day
  series generated with the same day-shape formula and seeds (spike on day 18
  for Northwind/Opus), month length 30, EUR formatting.
- Clean-room: all markup/CSS/JS rewritten (own `agu-` classes, own structure);
  no compiled-source text copied. `index.html` contains zero `innerHTML` uses.

## What matches the original
Layout (spend card → where-it-went + detail → notes), colours via tokens,
rolling live totals, chart + forecast + budget line, per-group bars, task lists,
status/warn states, responsive stacking, keyboard support (chart arrows/Escape,
segmented tabs as tablist).

## In-place updates (v4) / polish (v5)
- DOM built once in `build()`; ticks/hover/focus only set `textContent`,
  attributes, `style`, `d`, `cx/cy` on existing nodes — no `innerHTML` anywhere.
- Head starts with the `/*noflash*/` guard + `html{background}` paint rule +
  `color-scheme` meta; default follows `prefers-color-scheme`, toggle overrides
  via `localStorage('agu-theme')`.
- All `:hover` rules inside `@media (hover:hover) and (pointer:fine)`;
  `html{-webkit-tap-highlight-color:transparent}`;
  `body{font-variant-numeric:tabular-nums}`; cards use 1px borders + soft
  shadows; concentric radii (card 16px / tasks 10px / pills 999px).

## Verification (node only, no browser)
- `node --check node-check-target.js` → OK (app script syntax).
- `node --check harness.js` → OK.
- `node harness.js` → PASSED: visible painted text (totals, all project/model
  names, all 3 notes, stats, tasks), full-loop identity (223 nodes identical
  objects across all 5 feed ticks, all refs kept), zero `innerHTML` writes
  after init and after hover, light AND dark (`data-theme` switch, text still
  painted in both).
- Spent-total check: starts €270.40, ends €273.74 after one full loop.

## What could not be verified
- Pixel-exact match vs the original's larger app shell (nav rails, side panel
  chrome) — out of scope for this standalone page; only the Usage screen body
  was replicated.
- Real-browser paint/contrast eyeballing (no browser available); dark/light
  consistency is enforced through shared tokens and asserted via DOM state.

## How to test
1. `node --check node-check-target.js && node harness.js` (this directory).
2. Open `index.html` in a browser: watch the total tick up every ~3.4s,
   hover the chart, switch Projects/Models, click rows, press Open on notes,
   toggle the ◐/☀ button, resize narrow, try keyboard on the chart.
3. Confirmed: works in light AND dark mode (toggle + `prefers-color-scheme`).
