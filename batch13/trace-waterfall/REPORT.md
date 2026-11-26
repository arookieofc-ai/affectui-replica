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

## Browser-QA triage (ground truth from `demo-original.js` — read first)
- **(1) "Row labels ellipsize to unreadability" — NOT a defect, matched to original.**
  The original *does* ellipsis titles: `.ui-trw__label{flex:1;min-width:0;overflow:hidden;
  white-space:nowrap}` + `.ui-trw__title{flex:none;max-width:100%;overflow:hidden;
  text-overflow:ellipsis}` + `.ui-trw__detail{min-width:0;overflow:hidden;text-overflow:ellipsis}`.
  So `Read pricing frames · Figma` truncating under a narrow name column is original behaviour.
  Fix applied: verified the tree/title geometry equals the original
  (`--tw-name:236px` = `--ui-trw-name`, pad 10 / gap 14 / end 16, indent 14, row 32, bar 16,
  `grid-template-columns:var(--tw-name) minmax(0,1fr)`), and made the inherited
  `white-space:nowrap` explicit on `.tw-title`/`.tw-detail` so the computed ellipsis is
  identical. Readability now matches the original by construction; ellipsis itself was kept.
- **(2) "Span rows blank / ~2px garbled fragments at loop boundaries and after theme switch" — REAL defect, fixed.**
  Root cause: the old `render()` did `while (rowsBox.firstChild) removeChild` + rebuild on every
  state change, and `renderStats()` rebuilt the stats DOM on *every tick*. At the 17 s → 0 s wrap
  every row was unmounted and re-created, so all rows restarted the `tw-row` enter animation
  (`from{height:0;opacity:0}`) in the same frame — one blank frame / rows painting at ~2px
  mid-animation. Fix: in-place reconcile — persisting row nodes are reused and reordered with
  `appendChild` (entry animation fires only for genuinely new ids), only departed ids are removed
  (root persists, so the wrap never blanks), ticks rebuild only when the range `W` changes, stats
  build once then update `textContent` in place, per-tick `sync()` touches only text/positions.
  Theme switching never called `render()`; asserted it still doesn't (no rebuild, clock preserved).
  Loop-boundary choreography itself was already the original's (research ≥6.9 s, writer ≥8.3 s)
  and was kept verbatim.
- **(3) "Details dialog auto-opens on the failed span and covers top rows" — NOT a defect, kept.**
  The original demo loop contains `l(f>=8.9&&f<10.9?'tests':null)` — it auto-opens `Run checkout
  tests` 8.9–10.9 s unless the user has taken over (`u.current` guard). Removing the auto-open
  would *diverge* from the original. Kept verbatim (auto-open window + manual-takeover handoff);
  popover stays below-row anchored with above/below flip, opens only on `pointerdown` capture,
  closes on outside `pointerdown`/Escape.

## Verification (no browser available — node only)
- `node --check` on the extracted inline script: passes.
- `node verify.cjs` (in-directory DOM-stub harness, no `/tmp`, no installs): **126/126 green**.
  It loads the page script, steps the full loop in 0.1 s increments, and asserts: Live→Done header,
  pre-`at` spans hidden, auto-collapse/open windows, all 23 spans + verbatim strings present as
  *visible* text (base CSS parsed to prove no `display:none`/`visibility:hidden`/`font-size:0`/
  `color:transparent` rule applies to asserted text classes; narrow-viewport duplicate verified as
  `display:flex`), 9-cell pixel-marks, pointerdown-capture dialogs, `setAttribute` SVG classes,
  `[hidden]{display:none}`, 48 reconciles vs 176 light syncs (no per-tick rebuild), hover/focus
  paths never re-render, default light theme, toggle→dark + persistence, dark defines all 54 tokens.
- **Light AND dark checked**: harness toggles to dark and re-asserts *visible painted text*
  (Orchestrator/Researcher/Writer/Coder/Run checkout tests/Fix coupon handling/Open pull request,
  Live/Done header, stats values) plus a parse proving the dark theme block hides no text class.
  Specific-fix asserts: tree widths equal the original (236/10/14/16/14/32/16 + name-grid +
  ellipsis kept), auto-open window string present and `t=9.5 → openId tests`, loop never blanks
  (min visible rows ≥1 across 175 ticks incl. wrap, root persists), no `rowsBox.firstChild` clear,
  persisting nodes keep DOM identity across a state change, theme toggle preserves `t`, adds zero
  renders, and keeps every row id.
- Not verifiable here: actual pixel rendering/screenshot (headless Chrome cannot run in this
  environment) — open `index.html` in a browser to eyeball both themes.

## How to test
Open `index.html` in any browser (double-click works, no server needed). Watch one 17 s loop,
click rows/chevrons, toggle the theme, replay. Run `node verify.cjs` for the automated checks.
