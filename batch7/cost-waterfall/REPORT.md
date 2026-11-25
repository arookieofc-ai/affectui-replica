# cost-waterfall — replica report

## What was built
`index.html` (50 KB, self-contained, no network, system fonts) — a clean-room
replica of the affectUI Pro **cost-waterfall** component: a waterfall of LLM,
tool, and sub-agent steps showing tokens, cost, and time.

- Header: spark glyph + `Run cost` + task `Report on LLM API prices in 2026` +
  Cost/Tokens segmented switch + Live/Done/Failed pill.
- Stats row: Total cost (`$0.46` at end), Total tokens (`115k`, `115k in · 10.4k out`),
  Most expensive (button that jumps to `Write the report`).
- Waterfall rows with indent guides, chevron collapse, per-kind icons/bars,
  In / Out / Cost / Tokens / Time columns, axis ticks, running shimmer, `Top` flag,
  `+N` badge when a parent is collapsed, failed-row styling for `check_links`.
- Click a row (or Enter/Space, arrows/Home/End/Escape) to open its detail
  (Task/Result, Prompt/Response, or Input/Output; mono for tools; 404 error box).
- Auto-playing 17.5 s demo loop; any user interaction (mode/collapse/open/replay)
  takes over the timeline. Replay button restarts. Responsive at 760 px / 540 px.

## Original data used (read from `demo-original.js`, re-typed — not copied)
- Price table ($/M in/out): Opus 5.5 [5,25], Sonnet 5.5 [3,15], Haiku 5.5 [1,5],
  GPT-6 Sol [2.5,15], Gemini 3.8 Flash [0.3,2.5].
- All 12 steps with exact ids, names, kinds, models, details, at/end times,
  tin/tout, prices, inputs, outputs, and the `check_links` 404 error.
- Timings: run 11.1 s, loop 17.5 s, duration scale ×2.5, row stagger 36 ms,
  axis-range ease 720 ms; auto-collapse `research` at t≥5.4, auto-open `write`
  at loop 11.7–13.9, auto tokens-mode at loop 14.3–16.7.
- Formatters identical in behaviour: `$0.04`-style costs, `115k` tokens,
  `3.0s`/`250ms` durations. Overall status = Failed only if the last step failed
  (so this run ends `Done` despite the failed link check).

## Interactions
Mode toggle, collapse/expand parents, open/close details, most-expensive jump,
keyboard tree navigation with roving tabindex, replay, theme toggle
(`data-theme` on `<html>`, defaults to `prefers-color-scheme`, override saved).

## Robustness (past failure modes)
- Re-render only when a structural signature changes (mode/collapse/open/
  step statuses/axis target). Live counters update via direct text updates —
  verified: signature identical across a 50 ms live tick, different on status flips.
- Detail toggling is handled on `pointerdown` with capture, plus a deduped
  `click` fallback, so a real mouse click is never lost across a rebuild.
- Each agent pixel-mark is a deterministic FNV-1a hash of the agent id and the
  markup contains **exactly 9 `<i>` cells** (asserted for both agents; they differ
  per id). Running agents twinkle.

## Token audit
All colours are CSS custom properties under `:root` / `html[data-theme="dark"]`;
no ad-hoc per-element hex. Radii 16/10/6 px, pills 999 px, 150–320 ms eases.

## Contrast results (computed in `harness.cjs`, all ≥ 4.5:1)
Light — ink/surface 17.93, muted/surface 5.36, running 5.49, done 5.47,
failed 4.69, top 5.33, waiting 6.37.
Dark — ink/surface 14.52, muted/surface 7.20, running 7.40, done 6.88,
failed 6.73, top 8.09, waiting 12.03.
(Two light-theme greens/ambers were darkened from the demo's raw hues to pass.)

## How to test
1. Open `index.html` in a browser (no server needed). Toggle the Dark/Light
   button top-right to check both themes.
2. `node harness.cjs` — static checks + `node --check` on the page script +
   headless run (DOM stub, fake rAF clock through the full loop, pointerdown
   simulation, pixel-cell counts, contrast audit). Currently 69/69 pass.
3. `node --check` is run by the harness on the extracted script each time.

## Could not verify
Pixel-perfect match to the original Pro render (no screenshot comparison available
here); exact proprietary icon paths were redrawn as original SVGs with the same
roles. Dark is offered via toggle with light default per `prefers-color-scheme`;
the demo's own default tray is light for this component.
