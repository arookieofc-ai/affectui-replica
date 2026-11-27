# Revenue Chat — replica report

## What was built
Standalone interactive `index.html` (48 KB, inline CSS + JS, no external deps) replicating
affectUI **Revenue Chat** (slug `revenue-chat`, Analytics): a chat that answers revenue
questions with KPI cards, SVG charts, sources, follow-up chips and drill-down.

Behaviors replicated from the demo (`demo-original.js`, values used verbatim):
- Start screen: "Ask about your revenue" + Stripe/HubSpot subline + 3 chips
  (`How did revenue develop last quarter?`, `Split it by region`, `Forecast Q4`).
- Q3 answer: typewriter text, KPIs (Revenue $1.24M +18.2%, New MRR $86K +9.4%,
  Churn 2.1% −0.6%), 13-week trend chart (W27–W39, this year vs last year,
  "Back to school · +38%" marker at W35), caption, sources, Copy/Download/Good/Try-again,
  next chips (`Split it by region`, `Forecast Q4`, `Why did week 35 jump?`).
- Region split: 4 stacked plan bars (Europe $613K, North America $421K,
  Asia-Pacific $161K, Latin America $44K) vs Q2 $1.05M; click/tap a bar to drill down
  ("Europe brought in $613K…"). "Click / Tap a bar to ask about it" hint.
- Q4 forecast: KPIs ($1.41M +13.7%, range, 78%), Jul–Dec line chart
  (actual solid / forecast dashed / $450 target dotted); "Drag across / Slide a finger
  across … weeks/months – or press Enter, move with ← →, then Enter again" hint.
- Selection flow: drag across trend/forecast or click a region bar → floating
  "Ask about {label}…" dialog → drill-down answer with recomputed totals/deltas.
- Thinking state ("Reading Stripe and HubSpot…", busy 3×3 pixel-mark, ~1400 ms delay),
  shimmer, caret, staggered KPI rise, "Copied" live region, quote chips on drill answers,
  fallback text for unknown questions, composer with verbatim placeholder.
- Deterministic 3×3 pixel-mark per answer (pattern 0,1,0 / 1,1,1 / 1,0,1 with staggered
  delays), twinkling while busy.
- Responsive: ≤560 px stacks (mark hidden, KPIs 2-col with first-of-3 spanning,
  touch hint swap, 36 px targets on coarse pointers); reduced-motion short-circuits
  typewriter and delay.

## What matches the original
Layout (760 px column, 28 px turn gaps, right-aligned user bubbles, mark + body answers),
card styles (14–16 px radii, 1 px border + soft shadow), system font stack, 14 px body /
12–13 px meta, token-driven light + dark themes, icon action row with delayed tooltips,
chip buttons with arrow affordance, and all user-visible strings/formatting above.

## What could not be verified
Pixel-exact match (no screenshots in this environment; verified structurally via DOM stub).
The original's internal chart/tooltip/composer sub-components were re-implemented
clean-room as SVG/DOM, so hover tooltips and drag physics are faithful approximations.
Download-chart serializes the SVG (Blob) rather than the original's exact export path.

## How to test
Open `index.html` in a browser. Click the sun/moon button (top-right) to toggle
light/dark. Try: start chips → follow-up chips → drag across the trend chart →
click a region bar → keyboard (Tab to chart, Enter, ←/→, Enter, Esc) → copy/good/retry.

## Verification (node only, no browser)
- `node --check harness.js` — harness itself parses.
- `node harness.js` — **HARNESS OK (43 checks)**: inline script parses
  (`vm.Script`, the `node --check` equivalent for shipped inline JS); noflash guard first
  in `<head>` + `meta color-scheme` + first-frame bg rules; all `:hover` rules gated in
  `@media (hover:hover) and (pointer:fine)`; `tabular-nums`; tap-highlight; light+dark
  token sets; verbatim demo strings; DOM-stub run asserting VISIBLE painted text
  (start, $1.24M trend, split, $1.41M forecast), full-loop node identity across
  user→answer→split→forecast (element + typed text-node `===`), zero `innerHTML`
  writes after init (setter trap + source scan), and painted text in both themes.
- Clean-room: no `innerHTML`/`insertAdjacentHTML`/`outerHTML` anywhere; timers mutate
  only text/class/style/attributes of existing nodes; answers are appended once and
  re-typed in place. `index.html` is 48 KB (< 200 KB).

Checked 2026-11-27: light AND dark confirmed via harness + token review
(amber adjusted to `#fbbf24` on `#451a03` for dark).
