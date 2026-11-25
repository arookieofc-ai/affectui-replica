# model-router — replica report

## What was built
Self-contained `index.html` (43 KB, no network, system fonts) replicating the
affectUI Pro **model-router** card: a router that picks which model handles each
request, showing per-model costs and p95 latencies.

Layout (matches original): header (`Model router` title + live `chat-prod` env
pill with green dot) → summary row (Blended cost + big $/1K price left, strategy
radiogroup tabs right) → animated flow diagram (entry port → curved band per
model, glowing packets streaming proportional to share, model names right) →
routes table (Share bar + %, p95, $/1K) → Fallback row (switch + two model
pickers with pop-up menus) → footer (status dot + `Policy v14 · Live on
chat-prod`, Revert ghost button, Deploy button with spinner/check states).

## Original data used (from demo-original.js, re-typed — no source copied)
- Models: `Claude Opus 5.5` (Anthropic, p95 2.16s, $0.0126) · `GPT-5.5`
  (OpenAI, p95 1.34s, $0.0048) · `Gemini 3 Flash` (Google, p95 0.64s, $0.0007)
  · `Grok 5 Fast` (xAI, p95 1.09s, $0.0019)
- Strategies: Cost {6,21,49,24} · Balanced {17,42,27,14} · Quality {58,30,8,4}
- Live policy: Balanced + fallback enabled Opus→GPT, version 14, env `chat-prod`
- Behaviours: blended = Σ share×cost; money fmt 2/3/4 dp; delta % vs live with
  green cheaper / red pricier pill (`Same as live` / `Live policy` when 0/clean);
  tabs radiogroup with arrow-key nav; hover dims other routes to 75% opacity
  (≥0.75 legibility rule); fallback from/to auto-swap to stay distinct;
  deploy waits 900 ms (0 under reduced-motion) then version+1; rolling-number
  animation 460 ms; packets spawn ∝ share at 3.6/s, ~1.9 s traverse, max 18;
  responsive: stacked summary + hidden p95 under 520 px.
- Logos: original vendor SVGs replaced with deterministic 3×3 pixel-marks per
  model id (hash → 9 bits, centre always filled, twinkle on flow ends).
  Generator loop bound is exactly 9 — audited by the harness.

## Interactions
Strategy tabs (click + ←/→), row/end hover highlight, fallback switch, two
model pickers (open on pointerdown/mousedown capture, Esc/arrows/Home/End/Tab,
outside-pointerdown closes), Revert, Deploy (→ Deploying… → Deployed ✓),
theme toggle top-right (light ⇄ dark, defaults to prefers-color-scheme).

## Token audit
All colours via `:root` / `html[data-theme="dark"]` custom properties —
surface, page, ink, muted, subtle, border, radii (16/10/6), shadow, pop, plus
status tokens (blue/good/bad/warn/live/button/focus/track/sel). No ad-hoc hex
in component rules; card uses 1px border + soft shadow, 150–200 ms easings,
999px pills, tabular numerals.

## Contrast results (all ≥ 4.5:1, WCAG AA)
Light — ink 17.49 · muted 4.80 · good 5.04 · bad 5.52 · warn 6.37 · blue 5.57.
Dark — ink 14.52 · muted 6.63 · good 9.36 · bad 7.45 · warn 12.03 · blue 5.32.

## Verification
- `node --check .page-script.check.js` (extracted inline script): syntax OK.
- `node harness.js`: headless DOM-stub run — boots clean, 3 tabs, 4 exact-name
  rows, blended math `$0.0046`, packets spawn + advance via rAF, dirty status +
  `+92%` delta on Quality switch, hover set/clear, deploy 900 ms → v15
  `Deployed to chat-prod`, menu opens on mousedown capture, theme flips both
  ways. ALL HEADLESS CHECKS PASSED.
- Not verified in a real browser (no browser here); open `index.html` directly
  to test visually in light and dark.

## Files
`index.html` (deliverable) · `harness.js` (stub harness, kept in-dir) ·
`.page-script.check.js` (extracted script for node --check) · `REPORT.md`.
