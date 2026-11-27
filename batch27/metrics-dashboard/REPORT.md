# Metrics Dashboard — replica report

## What I built
Standalone `index.html` (40 KB, no deps, system fonts) replicating the affectUI
“Metrics Dashboard” (slug `metrics-dashboard`, Analytics): sales overview with
selectable KPI cards, switchable trend chart, top products, channels.

- Header: `Sales` + `Northwind Store · Last N days`, range segmented control
  (Week / Month / Quarter = 7d / 30d / 90d), Export button (→ `Exported` + check
  for 1.6 s, in place).
- KPI cards (tablist): Revenue / Orders / Avg. order / Refund rate, value +
  change pill (%, pts for refund rate, ↑/↓, green/red/flat, lower-is-better for
  refunds). Roving tabindex, Arrow/Home/End, click to switch metric.
- Trend chart: line/area ⇄ bars segmented toggle, “Compare to previous period”
  switch (dashed previous-period overlay), 4 gridlines + compact axis labels,
  x labels, hover/focus tooltip (tip + value + previous), empty-state text.
- Lists: Top products (Linen overshirt, Everyday tote, Merino crew,
  Canvas sneaker, Wool beanie) and Channels (Online store, Instagram,
  Marketplace, Wholesale, Pop-up); bar width = share / max share, value =
  total revenue × share, tabular numbers, animated count-up in place.
- Responsive: 4→2 KPI columns, 2→1 lists, wrapping bar; coarse-pointer taller
  targets; reduced-motion disables thumb/bar/switch transitions and count-up.

## Demo data verbatim
Ranges, metrics, products, channels, seeded 180-day generator (LCG
`seed*16807%2147483647`, weekday factors `[1.22,.82,.86,.9,.96,1.1,1.3]`,
drift `92+r*.32`, price `61+r*.03±4`), sum/bucket aggregation and
Intl formatters copied in behaviour (own code, same numbers).

## What matches the original
Layout (tray → card, bar, KPIs, chart + 2 lists), period labels, KPI set,
product/channel names + shares, line/bars + compare tools, export pattern,
compact axis formatting, animated list values, keyboard radio/tab groups.

## What I could not verify
Pixel-perfect chart path vs the closed `component-CgV7qgrx` renderer and exact
KPI pill component (`component-kNvvgSI4`) internals — re-implemented from
observed behaviour. No browser was launched (per task rules).

## How to test
Open `index.html` in a browser. Or node-only (no browser):
`node --check` on the extracted inline script + `node verify.js`
(DOM-stub harness asserting visible text, node identity, zero innerHTML writes,
light + dark).

## Checks
- `node --check` on the extracted inline script → OK.
- `node verify.js` → ALL CHECKS PASSED: visible painted text (all titles,
  ranges, KPIs, products, channels), full-loop node identity (range/KPI/chart/
  rows/tip/export kept across 7d→30d→90d × 4 metrics × line/bars × compare),
  zero `innerHTML`/`outerHTML` writes after init and after loop, light AND dark
  `data-theme` both render finished text.
- Light theme default follows `prefers-color-scheme`; toggle overrides and
  persists (`md-theme`). No-flash guard + `color-scheme` meta; dark uses tuned
  tokens (no grey-on-grey, borders visible). v5: hovers only in
  `@media (hover:hover) and (pointer:fine)`, `tabular-nums` on body, concentric
  radii (22 = 16 + 6), shadows for elevation / borders for structure, optical
  export padding `0 12px 0 10px`.
