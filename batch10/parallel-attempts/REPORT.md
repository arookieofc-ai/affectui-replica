# parallel-attempts — clean-room replica report

## What was built
`index.html` (27 KB, single file, no network, system fonts only) replicates the
affectUI Pro **parallel attempts** component: several agents try one task side by
side, each row showing identity + approach, live status line, progress lane, score,
and `took · cost` meta. A 100 ms timer drives a 15 s loop; when every attempt
settles, the highest score gets a **Best** badge, **Use this one** radio buttons
appear, and the best is auto-picked (clicking another dims the rest).

## Original data used (from `demo-original.js`, no invented data)
- Task: `Fix the flaky checkout test`, title `Best of 3`
- `Opus 5.5` / `Add a retry with backoff` / ends 9.2 s / score 78 / cost $0.31 /
  steps `Reading checkout.spec.ts → Writing the retry → Running tests` /
  note `20/20 runs green · adds 1.4s per test`
- `GPT-6 Sol` / `Mock the payment API` / ends 7.4 s / score 94 / cost $0.27 /
  steps `Reading payment.ts → Writing the mock → Running tests` /
  note `20/20 runs green · suite 30% faster`
- `Gemini 3.8 Pro` / `Wait for the network to settle` / ends 6.1 s / **fails** /
  cost $0.18 / steps `Reading checkout.spec.ts → Adding the waits → Running tests` /
  note `Still flaky – 3 of 20 runs failed`
- Timings/behaviour: 100 ms tick, 15 s loop restart (`_=15`), took = ends × v
  × 1000 ms with `v=17` (`2m 36s`, `2m 06s`, `1m 44s`). The ×17 is the
  original's own demo time-dilation, NOT a bug: `demo-original.js` defines
  `_=15,v=17` and its `y=e=>g.map(...)` view-model line computes
  `took:t.ends*v*1e3`, displayed through the original's own `s` duration
  formatter (the `i=1e3` / `m + pad2(t%60) + s` formatter). So the ORIGINAL
  itself displays `2m 36s · $0.31` / `2m 06s · $0.27` / `1m 44s · $0.18`.
  The 9.2s/7.4s/6.1s values are the `ends` demo-time finish points, not the
  displayed durations — an earlier QA brief mistook them for the displayed
  metas, and a prior replica revision wrongly dropped the ×17 (showing
  `9.2s`/`7.4s`/`6.1s`). Restored to the original behaviour now. Failed bar
  caps at 62 %, running floor 3 %, `Running tests k/20` counter, cost accrues proportionally
  while running (total `$0.76`), `$x.xx` / `NNms` / `NNs` formatters as in the
  original.
## Interactions
- Live progress bars with sweep/glow while running; stale results replaced by
  fade-swap animations (no full rebuild — rows are built once and patched in
  place, so clicks are never lost across ticks).
- Pick via `pointerdown (capture) + click` delegation on the persistent panel;
  ArrowUp/Down/Home/End move between Use options; `role=radiogroup/radio`,
  `aria-checked`, focus-visible outlines.
- Overlap fix (visual QA defect a): mid-run, the picked row's live score %
  and its stale `✓ In use` pill used to paint in the same spot. Root causes:
  (1) author CSS `display:inline-flex` on `.ui-pa__use` beats the UA
  `[hidden]{display:none}`, so `hidden=true` alone never hid the pill, and
  (2) the tick's running branch never cleared the previous completion's
  `data-on`/pill content, leaving it at `opacity:1` over/under the live `%`.
  Fix: explicit `.ui-pa__use[hidden]{display:none}`, the running branch clears
  stale `data-on` (pill rebuilds fresh at the next completion), and
  `.ui-pa__end` stacks score and meta-slot as separate grid rows with a 2px
  row-gap. The pill now exists only for done rows once everything settles,
  exactly like the original.
- Theme toggle (top-right, sun/moon) flips `data-theme`; default follows
  `prefers-color-scheme`, override persisted to localStorage.
- Narrow (≤560 px): rows stack, lane spans full width, approach hidden, status
  line clamps to 2 lines.
- Deviations from the literal original, per v3 spec: brand SVG icons replaced by
  deterministic **3x3 pixel-marks** (FNV-1a hash of agent id → hue + pattern,
  centre cell always on, running rows twinkle); dimmed rows use opacity 0.78
  (spec floor 0.75) instead of 0.55 for legibility; light running-ink is a darker
  blue `#0369a1` so running text passes contrast.

## Token audit
All colours flow through CSS custom properties. Light: surface `#ffffff`,
page `#fafaf9`, ink `#171717`/`#1c1917`, muted `#6f6a63` (darkened one step from
the spec's `#78716c`, which scored 4.40 on the tray — see below), subtle
`#f5f5f4`, border `#e7e5e9`-family `#e7e5e4`, radii 16/10/6 px, shadow
`0 1px 2px rgba(0,0,0,.05), 0 4px 16px rgba(0,0,0,.05)`. Status blues/greens/reds
match the original demo's running/done/failed fills and edges; dark theme maps
the same tokens (`#1c1c1f`/`#101012`/`#ededed`/`#a1a1aa`/`#26262a`/`#2e2e33`,
amber `#fbbf24` on `#451a03`). No hard-coded hex outside `:root` /
`[data-theme="dark"]`. No text sits under buttons; rows reserve bottom padding.

## Contrast results (WCAG, computed)
Light — ink/surface 17.9, strong/surface 17.5, muted/surface 5.4,
muted/tray 4.9, running-ink/bg 5.2, done-ink/bg 6.1, done-ink/best 5.5,
failed-ink/bg 6.0. Dark — ink/surface 14.5, strong/surface 15.6,
muted/surface 6.6, muted/panel 6.1, running-ink/bg 7.2, done-ink/bg 6.7,
done-ink/wash 6.8, failed-ink/bg 6.6. All ≥ 4.5. (The `·` separator uses faint
grey 1.8 — purely decorative, adjacent to passing text.)

## Verification
- `node --check .page-script.check.js` (page script extracted from index.html) — passes.
- `node harness.mjs` — 89 headless checks pass: 3 rows, exactly 9 pixel-mark
  cells per row (27 total), tick animation of `--p`/steps/pct, tests counter,
  fail at 6.1 s, done scores/metas (`2m 36s · $0.31`, `2m 06s · $0.27`,
  `1m 44s · $0.18`), Best badge + auto-pick, pointerdown pick switch,
  arrow-key focus, 15 s loop reset with pick persistence, plus a mid-run
  layout-model check across two loop cycles proving the live score box and
  the Use box are disjoint (pill hidden, no stale `data-on`, score and pill
  in different rows) while the pick persists, and the CSS `[hidden]` guard
  that makes it true in a real browser.
- Checked light AND dark: toggle verified in harness; visually the dark theme
  re-skins every token (no inverted-text artefacts).

## How to test
Open `index.html` in a browser. Watch three attempts run (~9 s), Gemini fail,
Sol win Best, then pick a different attempt and reload the 15 s loop.
