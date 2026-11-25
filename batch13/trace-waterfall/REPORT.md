# Trace Waterfall — replica report

## What was built
`index.html` (55.8 KB, one self-contained file, system fonts, no network/assets) replicating the
affectUI **Trace Waterfall** component: live timeline bars for LLM, tool, and sub-agent calls with
tokens, cost, and the slowest call highlighted. Clean-room code written from the observed behaviour
of `demo-original.js` — no compiled source copied.

- **Header**: spark icon + `Trace` title + task text (`Launch the new pricing page by Friday`) + Live/Done pill.
- **Stats row**: Duration · Cost · Tokens · LLM calls · Tool calls · Errors (grows live, tabular numerals).
- **Rows**: chevron (fold/unfold), icon, single-line name + detail (ellipsis), `+N` folded badge,
  running spinner / failed warning, duration `·` cost tag placed after/inside/before the bar,
  `Slowest` badge on the longest completed LLM/tool span, time-axis ticks, live now-line.
- **Details popover** (`role=dialog`): kind · model, status pill, close button, Duration/Started/Cost/
  Tokens in-out/Spans grid, error box, Input/Output.
- **Keyboard**: tree/treeitem roles, roving tabindex, arrows/Home/End/Left/Right, Enter/Space opens,
  Escape closes. Popover opens on `pointerdown` capture, closes on outside `pointerdown`/Escape.
- **Loop**: 13.6 s trace on a 17 s loop (rAF-driven, throttled like the original): Researcher
  auto-collapses at ≥6.9 s, Writer at ≥8.3 s, `Run checkout tests` auto-opens 8.9–10.9 s; any manual
  fold/open hands choreography to the user; Replay button restarts. Narrow widths stack rows
  (name above bar, meta shown, tag hidden).
- **Identities**: deterministic 3×3 pixel-mark (exactly 9 cells, hashed hue per id, twinkle while
  running) for agent/sub-agent/LLM rows; small circular letter badges for tools.
- **Themes**: CSS custom-property tokens; default light (original demo appearance); sun/moon toggle
  top-right flips `data-theme`, persists to localStorage, falls back to `prefers-color-scheme`.
  Dark redefines every token (amber waiting adjusted to `#fbbf24` on `#451a03`).

## Original data/behaviour matched (verbatim)
All 23 spans with exact names, kinds, details, models, timings, inputs, outputs, and the one
`fails` flag (`Run checkout tests`, error `2 of 14 checkout tests fail – coupon codes aren't applied
to seat prices`). End-of-trace values: cost `$0.49`, tokens `99.7k`, 5 LLM / 14 tool calls, 1 error,
slowest = `Draft plan copy` (3.9 s). Same formatting rules ($-cost tiers, ms/s/m-s durations, k/M
tokens) and the same 17 s loop choreography.

## Verification (no browser available — node only)
- `node --check` on the extracted inline script: passes.
- `node verify.cjs` (in-directory DOM-stub harness, no `/tmp`, no installs): **93/93 green**.
  It loads the page script, steps the full loop in 0.1 s increments, and asserts: Live→Done header,
  pre-`at` spans hidden, auto-collapse/open windows, all 23 spans + verbatim strings present as
  *visible* text (base CSS parsed to prove no `display:none`/`visibility:hidden`/`font-size:0`/
  `color:transparent` rule applies to asserted text classes; narrow-viewport duplicate verified as
  `display:flex`), 9-cell pixel-marks, pointerdown-capture dialogs, `setAttribute` SVG classes,
  `[hidden]{display:none}`, 48 full renders vs 176 light syncs (no per-tick rebuild), hover/focus
  paths never re-render, default light theme, toggle→dark + persistence, dark defines all 54 tokens.
- **Light AND dark checked**: full token sets for both asserted in CSS; toggle behaviour executed
  in the stub for both directions. Not verifiable here: actual pixel rendering/screenshot
  (headless Chrome cannot run in this environment) — open `index.html` in a browser to eyeball both
  themes.

## How to test
Open `index.html` in any browser (double-click works, no server needed). Watch one 17 s loop,
click rows/chevrons, toggle the theme, replay. Run `node verify.cjs` for the automated checks.
