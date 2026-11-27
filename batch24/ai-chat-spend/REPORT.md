# REPORT — AI Chat / Spend Planner (ai-chat-spend)

## What was built
Standalone `index.html` (~44KB, inline CSS+JS, no deps) replicating the affectUI
"AI Chat / Spend" demo from `./demo-original.js` verbatim data.

- Header: `AI spend in November` + `Operations · 3 providers · 6 models`,
  working/answers count, `44k / 200k` context bar (thin 3px, right-aligned),
  sun/moon theme toggle top-right.
- Thread: initial user `Where does our AI spend go?` + assistant answer with
  3x3 pixel-mark, streaming text, KPIs, provider split bars, sources, actions,
  next-question chips, caption.
- Sample questions: `Where can we save?` (adjustable plan with 2 sliders +
  1 switch + live forecast), `Show the trend` (12-week W36–W47 area chart with
  W44 eval-run marker), `Which team spends most?` (team split), `Turn the plan
  into rules` (Permissions rules), fallback for unknown input.
- Interactions: composer send, next chips, click-a-bar drilldown
  (`Anthropic cost $37.3K in November. Opus 5.5 is most…`), trend drag/Enter
  range select + `Ask about …` dialog, plan levers update KPIs + forecast
  paths + `Over 6 months: … instead of …`, `Turn into rules`, copy/download/
  good/try-again buttons, keyboard support, responsive stacked layout.
- Clean-room: all HTML/CSS/JS written from behaviour description; no copied
  bundle source. In-place updates only — DOM built once, ticks update
  `textContent`/attributes/styles on existing nodes; zero `innerHTML`/
  `outerHTML`/`insertAdjacentHTML` anywhere in the file.

## What matches the original
All verbatim demo data: $48.2K (+22%), $3.10, 18.4K; Anthropic 26.1/9.8/1.4K,
OpenAI 5.9/1.1K, Google 3.0/0.9K; trend 7.1…11.2 vs 5.2…7.2 with `Eval run · +$8K`;
plan now 48200, Dec–May +6%, levers (18K×85% / 12K×90% max 80 / 7.4K×50%)
defaults 40/30/on → save ≈$13.06K ≈27%; team splits; rules text; captions,
sources (`Usage API`,`Billing`,`Permissions`), hints, `Reading your usage…`,
`Ask about spend, models or teams…` placeholder.

## What could not be verified
Pixel-perfect match to the original Pro screenshots (no screenshots in
workdir); exact SVG path geometry of the provider logos and the internal
`ui-muc`/`ui-trc` chart components (re-implemented as stacked bars + SVG
area/line charts with same data); real backend answers (fallback text used).

## Targeted fix 2026-11-27 — first-chart bars 77/15/8
Root cause: `splitNode()` in `index.html` computed `total` but never used it
for layout. Each `.sbar` track defaulted to 100% of its grid cell (`1fr`),
and inner `.seg` widths were `value/gsum*100%` (share *within* the provider),
so they summed to 100% for every provider. Result: Anthropic/OpenAI/Google
all painted ~full width despite labels 77%/15%/8%.
Checked `./demo-original.js`: same verbatim values (Anthropic 26100+9800+1400
=37300, OpenAI 5900+1100=7000, Google 3000+900=3900, total 48200 → 77.4/14.5
/8.1%). The original `chart:{kind:'split'}` data implies proportional bars;
the original does not exhibit the all-full-width behaviour, so the fix is
warranted.
Fix (one line, everything else identical): set the visible track width
proportional to share of total —
`bar.style.width=(gsum/total*100).toFixed(2)+"%"` — keeping seg widths as
`value/gsum`. Now Anthropic 77.39%, OpenAI 14.52%, Google 8.09%. Single-group
drilldowns stay 100%. No CSS override (`.sbar` has no width rule, inline
width wins in both themes). Kept `/*noflash*/`, in-place updates only, zero
`innerHTML` writes, demo data verbatim, click-a-bar handler untouched.
## How to test
- `node --check ./harness.js` then `node ./harness.js` — asserts visible
  painted text (65 strings), full-loop node identity, zero `innerHTML`
  writes after init, light+dark themes, plan math, plus provider bars
  77.4%/14.5%/8.1% as VISIBLE `style.width` in light AND dark, seg sums
  100%, and click-a-bar adds an answer. Currently: ALL CHECKS PASSED.
- Open `index.html` in a browser: ask each sample question, drag the trend
  chart, click a provider bar, move the three levers, toggle sun/moon.

## Light AND dark mode
Checked both: `data-theme="light"|"dark"` on `<html>` with token swap
(surface `#ffffff`/`#1c1c1f`, page `#fafaf9`/`#101012`), noflash guard shows
no white first frame in dark, amber waiting adjusted for dark, contrast
verified via harness theme flip + manual open. Toggle overrides
`prefers-color-scheme` and persists under `ai-chat-spend-theme`.
