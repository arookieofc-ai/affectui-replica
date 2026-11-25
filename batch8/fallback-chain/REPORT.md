# Fallback chain — replica report

## What was built
`index.html` (48KB, self-contained, no network, system fonts only) replicates the
affectUI Pro **fallback-chain** component: a chain of models/providers tried in order
until one answers.

Layout (matches original): header bar (request title + live state + total time +
total cost) → dotted-canvas card with a 5-column flow grid: Request node (132px) →
fan-out SVG links (40px) → 4 model rows → fan-in SVG links (40px) → Response node.
Each model row: 3×3 pixel-mark + attempt number, model + provider, live status line,
elapsed-time + cost meta, and a responsive segmented progress bar. Hover/focus/click
opens a tooltip popover (provider, region, status badge, Model/Time/Cost rows plus
the original Code/Tokens/Price/Why rows). Narrow screens stack to a 2-column list
with a vertical tree connector; the Response node hides, like the original.

## Original data used (from `demo-original.js`, re-typed — never copied)
- Title `Summarize support ticket`, route `openrouter/auto`.
- Request `HubSpot · Ticket #4821` + original brief, Input `1,284 tokens`,
  Order `Cheapest first, 5s each`.
- Response `Slack · #support-escalations` + original verdict text, Output `412 tokens`.
- 4 attempts with exact models/providers/regions/prices/reasons/notes:
  Claude Opus 5.5 (AWS Bedrock, us-east-1, Rate limited · 429) →
  GPT-6 (Azure OpenAI, Sweden Central, Timed out) →
  Gemini 3.8 Pro (Google Vertex, europe-west4, Answered · 412 tokens) →
  Grok 4 (xAI, us-west, Not needed).
- Exact timings: 0.8s initial wait, attempt ends at 1.6 / 6.6 / 8.5s, 5s timeout each,
  13s loop restart, 100ms tick; same `fmtDur`/`fmtCost` formatters
  (`1.6s`, `8.5s`, `$0.0006`, `$0.0027`, `<$0.0001`) and status rules
  (`Trying…`, reason text, `Answered · note`, `Not needed`, `Up next` for the queued row).

## Interactions
- Live looping timeline (waiting → trying → failed/answered → skipped), animated
  progress segments, dashed animated "trying" links, pulsing state dot + twinkling
  pixel-mark on the working row.
- Light/dark theme toggle (top-right, sun/moon), `data-theme` on `<html>`,
  defaults to light (original appearance) or `prefers-color-scheme: dark`.
- Click (pointerdown capture) pins a row/node popover; Enter/Space toggles, Esc closes.
- Retry button wired (appears only if every model failed, as in the original).

## Engineering notes (past failure modes)
- **No DOM rebuild in the tick loop**: markup is static; each 100ms tick only sets
  `textContent`/`data-status`/segment attributes, and only when a per-row signature
  (`status|text|time|cost|fill|count`) actually changed. Bar `<i>` nodes are created
  once and reused (count changes only on resize).
- **Clicks can't be lost**: popovers open on `pointerdown` capture, never in the tick path.
- **Pixel-marks contain exactly 9 cells** (verified): deterministic on/off pattern per
  model id with 4 distinct colours.

## Verification
- `node --check` on the extracted inline script: OK.
- `node harness.mjs` (DOM-stub harness kept in this directory): **ALL CHECKS PASSED**
  (202 checks) — loads the page's own script, drives fake time through the full 13s
  loop and asserts statuses/labels/totals (`8.5s`/`$0.0027`), link states, bar fill,
  node reuse, theme toggle, and pin/unpin behaviour, **plus** the visual-QA
  regressions: popover is portalled to `document.body` as `position:fixed`,
  `z-index:9999`, opaque `var(--surface)`, `280px`, revealed by `.open` (rows 1–2
  below / rows 3–4 above their anchor, nodes edge-aligned, clamped to viewport);
  all 4 model names present as real visible row text, all 6 popover titles complete
  (`AWS Bedrock`, `Azure OpenAI`, …), route is full `openrouter/auto` in mono `10px`,
  flow is `140px/48px` like the original, no whole-row dimming, status uses
  `≥4.5:1 --muted`/tone colours, response node shows `Waiting…` → `412 tokens` with the
  `Checkout fails for EU cards…` quote hidden until answered.

## Token audit
All colours flow through 37 CSS custom properties (light + dark token blocks);
no ad-hoc hex in any element rule (the only literal outside token definitions is a
`var(--px-c, …)` fallback; `#4821` is a text false positive from "Ticket #4821").

## Contrast results (WCAG AA, text ≥ 4.5:1)
Light — ink/surface 17.9, muted 4.8, wait 6.4, trying 7.2, ok 6.5, fail 5.3.
Dark — ink 14.5, muted 6.6, wait 12.0, trying 10.3, ok 12.3, fail 11.2. All PASS.
Pixel-mark cells are decorative (4.1/3.4:1, ≥ 3:1 non-text).
Waiting rows dim only logo+name (opacity .6) / skipped non-pop (opacity .5) per the
original — status/meta text is never dimmed, so every status stays ≥ 4.5:1.

## Visual-QA fixes (this round)
- **Popover overlap — real root cause**: not width/z-index/position (those already
  matched the original: `absolute/z-30/280px`). Comparing popover ancestors against
  `demo-original.js` showed a **stacking-context trap**: the original lifts the
  hovered ancestor above its siblings (`.ui-fbk__hov:is(:hover,:focus-visible){
  z-index:20}`) and never transforms rows/nodes on hover, so its in-grid absolute
  popover (z-30) paints above the chart. The replica had **no hover lift**, kept
  `.fbk-node{z-index:1}`, and added `translateY(-1px)` hover transforms on rows and
  nodes — every hovered row/node became its own trapped stacking context, so
  later siblings (row 2/3/4 text, icons, links) painted OVER the popover:
  truncated `Aws Bedro…`, node-2 text on the title bar, Model/Time/Code rows
  covered by row-3 text showing through, `o many requests`, icons poking through.
  Static audit also confirmed **no `overflow:hidden` clipping** on any chart
  ancestor (`.fbk/.fbk-card/.fbk-flow/.fbk-models/.fbk-model/.fbk-node`), so this
  was purely paint order, not clipping. Fix: **portal every `.fbk-pop` to
  `document.body`** once at startup; popover is `position:fixed; z-index:9999`,
  opaque `var(--surface)`, explicit `280px`, shown via `.open` and positioned by
  JS near its anchor (rows 1–2 below, rows 3–4 above, request/response below and
  edge-aligned, clamped to the viewport, repositioned on scroll/resize/tick).
  Hover transforms on rows/nodes were removed (the original has none) and the
  hovered/pinned anchor lifts to `z-index:20` like the original. Result: the
  popover has no clipping or stacking ancestor left and always paints opaque and
  on top in both themes; titles (`AWS Bedrock`) and `429 · Too many requests`
  render complete.
- **Model names**: kept as real visible row text (`.fbk-name`: `Claude Opus 5.5` /
  `GPT-6` / `Gemini 3.8 Pro` / `Grok 4`, provider shrinks first) — verified by
  stripping tags from each row's markup, not just `title`/ARIA. Status text
  (`Trying…`/`Timed out`/`Answered · 412 tokens`/`Not needed`) and meta stay
  full-contrast; route stays full `openrouter/auto` (mono `10px`).
- **Response node**: confirmed against `demo-original.js` — the node itself shows
  `Waiting…` → note (`412 tokens`) / `N failed`, never the Slack summary; the
  `Checkout fails for EU cards since 14:02…` text lives only in the response
  popover quote (hidden until `answered`), with the `Output · 412 tokens` row.
  Harness asserts both states.

## How to test
Open `index.html` in a browser (or `python3 -m http.server`), watch one 13s loop,
hover/click rows for details, toggle the moon/sun button for dark mode, narrow the
window below ~560px for the stacked layout.

## Not verified
Pixel-perfect match to the original Pro `.tsx` (only the compiled demo was read);
provider logo artwork is original (initials medallions + pixel-marks, not brand SVGs).
