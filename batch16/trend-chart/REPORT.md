# Trend Chart — rebuild report

## What was built
ONE self-contained `index.html` (27.6 KB, no network, system fonts) replicating the
`demo-Dr4Grdlp.js` demo: an **AI spend** card with Line/Area/Bar switch + 7D/30D range
switch, main SVG chart with This period vs Last period comparison and tooltip, plus
three linked sparklines (Tokens, Requests, Cost per 1k requests) sharing one hover index.

## Matched data / behaviour (verbatim from `demo-original.js`)
- End date `Date.UTC(2026,2,9)`, day step 864e5; short labels `Mar 3…Mar 9` (7d) /
  `Feb 8…Mar 9` (30d); long tooltip labels `Tue, Mar 3…Mon, Mar 9` etc. via
  `en-US/UTC` `toLocaleDateString`.
- Generator `u(n,base,seed,growth)` with weekend factor `((i+n)%7>=5?0.72:1)`,
  oscillation `1+.09*sin(i*1.7+n)+.05*cos(i*.6+n*2)`, growth `(1+r*i)`; bases/seeds:
  This `(412,1,.012)`, Last `(356,3,.006)`, Tokens `(384e5,2)`, Requests `(21800,4,.016)`.
- Formatters: spend `$x.xk`, compact `B/M/k`, cost `$x.xx`; totals/sums identical:
  7d total `$2.7k` (2689) change `+16.5%`, Tokens `257.7M`, Requests `144.6k`,
  Cost `$18.60`; 30d total `$13.4k` (13381) change `+24.6%`, Tokens `1.3B`,
  Requests `740.4k`, Cost `$18.07`.
- Controls: `Chart type` radiogroup (Line/Area/Bar, default Area),
  `Range` radiogroup (7D/30D, default 7D); `aria-checked` kept in sync.
- Shared `index`/`onIndexChange` across main + 3 sparklines; tooltips show
  `tooltipLabels` (main) / short `labels` (sparklines) with formatted values;
  keyboard arrows + Escape, focus selects last point, pointermove/down + leave.
- No timers in the original demo, so none added; all updates are state-driven.

## What could not be verified
- Pixel-exact styling of the private `component-*.js` chart renderer (not shipped);
  axes/grid/tooltip recreated clean-room with the same props (`variant/label/labels/
  tooltipLabels/series/format/index/onIndexChange`).
- Exact original bar geometry (grouped vs stacked); used grouped This/Last bars.

## How to test
Open `index.html` in a browser. Toggle Line/Area/Bar and 7D/30D; hover/tap charts
and sparklines — tooltips stay in sync. Toggle Dark/Light top-right. Narrow window
stacks the three small cards.

## Verification (node only, no browser)
- `node --check` on the extracted page script: PASS.
- In-dir DOM-stub harness (created, run, then removed): loaded the page script,
  asserted visible texts (`$2.7k/+16.5%/257.7M/144.6k/$18.60` → 30d
  `$13.4k/+24.6%/1.3B/740.4k/$18.07` → back), tooltips (`Mon, Mar 9`, `Fri, Mar 6`),
  shared spark tips, `aria-checked` per type, node identity of total/cur/prev/area/
  tooltip/bars across the full 7d→30d→7d × line/bar/area × index-sweep loop,
  zero `innerHTML` writes after init, and light+dark `data-theme` switching: ALL PASS.
- Polish: `:hover` only inside `@media (hover:hover) and (pointer:fine)`,
  tap-highlight transparent, `tabular-nums`, `[hidden]{display:none}`,
  SVG classes via `setAttribute` only, no external URLs, 27.6 KB < 200 KB.
- Light (default = original demo appearance) AND dark checked via tokens
  (`--page/--surface/--ink/--muted/--subtle/--border` + amber dark variant).
