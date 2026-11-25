# REPORT — Reasoning Summary replica

## What was built
`index.html` (36 KB, single file, inline CSS+JS, system fonts, zero network
requests) replicating the affectUI **Reasoning Summary** card:

- Page chrome per spec v3: project header (`rate-limit-retry` + live
  `N working · 3 agents` line), token-count context style
  (`59.3k / 200k`, thin 3 px bar, right-aligned label — 59.3k is the real
  summed input+output tokens from the demo data), and a visible sun/moon
  theme toggle (top-right) switching `data-theme="light" | "dark"`.
- The card itself: 3×3 pixel-mark (exactly 9 cells, twinkles while reasoning),
  `Reasoning` shimmer → `Reasoned for 11s`, segmented time bar with
  running-segment sweep/glow, per-kind rows (Search/Analyze/Code/Test with
  time totals), per-model rows (effort bars, role, time, click-to-expand
  details: provider · N steps · tokens · cost · note), footer with
  `Searched 24 sources` (stack avatars, expands to GitHub/Notion/Linear/Figma
  + `+20 more`) and a steps toggle, plus a polite aria-live announcement on
  settle. Keyboard: roving tabindex + arrows/Home/End in kinds and models,
  Escape closes panels.
- Clean-room code: own HTML/CSS/JS written from observed behaviour. Only the
  demo's data strings/numbers and the generic time/token formatters' behaviour
  were reproduced; brand logo SVGs were replaced with initial-letter badges
  (the original itself falls back to initial letters).

## Original data / behaviour matched
- All 6 steps verbatim (labels, kinds, models, 1800/1500/2200/1600/2600/1100 ms);
  all 3 models verbatim (names, roles, effort, providers, notes, tokens, costs);
  all 4 sources verbatim + `sourceCount=24`; `estimate=11000`.
- Loop timings from the demo scheduler: reveals at 1500 / 3700 / 5300 / 7900 ms,
  settles at 9000 ms, 4500 ms settle pause, 400 ms fade, then restarts at 2 steps;
  reset waits out hover/focus in 500 ms retries.
- Pixel twinkle delays `[0,120,240,120,240,360,240,360,480]`; formats
  (`1.8s`, `11s`, `20.5k`, `$0.06`…); kind totals
  (search 3.3s / analyze 2.2s / code 1.6s / test 3.7s); aria-live
  `Reasoned for 11s, 6 steps`.
- Hard-won rules honoured: full re-render only on state changes (120 ms tick
  touches only text nodes / flex-grow); hover/focus only toggle attributes,
  never re-render; toggles are native `<button>` clicks (no floating
  popovers/dialogs exist); `[hidden]{display:none}` is explicit and no
  `display:none`/`visibility:hidden`/`color:transparent`/`font-size:0` rule
  applies to any text class (collapsed panels use `grid-template-rows`
  animation); SVGs carry static `class`-less markup and JS uses only
  `setAttribute` (no `.className` assignment anywhere).

## Fix (2026-11-25 visual-QA failure: model row click did nothing)
- Symptom: four real mouse clicks on the GPT-5.5 row (light final, light
  mid-loop, dark final) left `aria-expanded` collapsed with no detail panel,
  while the DOM-stub harness passed.
- Root causes (both fixed, behaviour now matches `demo-original.js`
  `onClick:()=>P(e=>e===n.id?null:n.id)` toggle which persists across steps):
  1. Shared-closure bug: `wire()` used `var idx` incremented in a `forEach`,
     so every model button's click handler read the final `MODELS[3]`
     (`undefined`) and threw / never toggled. Fixed by id-based toggle.
  2. Per-node listeners on buttons rebuilt by every `render()` (`innerHTML`
     replacement): a scheduled step reveal between `mousedown` and `mouseup`
     destroys the target node, so a direct `click` listener never fires.
     Fixed with one delegated `click` listener attached ONCE to the stable
     `#card` element (`ensureDelegated()`); the handler resolves the model via
     `target.closest('.rs__model-btn')` + `data-model` id and toggles
     `state.expanded`, then `render(false)`. Clicks therefore bubble to `#card`
     even when the button node is replaced mid-gesture. Same delegation covers
     the footer `sources`/`steps` toggles. `render()` still preserves
     `state.expanded`/`state.panel`, and the 120 ms tick still touches only
     text/flex (never rebuilds), so the panel STAYS open across loop stages
     until clicked again, in both themes.
- Markup change: model buttons now carry `data-model="<id>"` (invisible,
  used only for delegation). All demo data, timings, formats, and styles are
  otherwise byte-identical in behaviour.

## Verification (`node harness.js` — in-dir, no installs, no browser)
- `node --check` passes on the extracted page script.
- Page script loads under a DOM stub; pure-API asserts cover all verbatim data,
  formats, 9-cell mark, and every loop state shown=2..7.
- The **real boot code** runs on a stub DOM with a fake clock: step reveals at
  1500/3700/5300/7900 ms, settle at 9000 ms, hover-guard retry at +500 ms,
  fade + restart after hover ends — all asserted on the produced markup.
- CSS audit asserts the `[hidden]` rule, no hiding rules on text elements, and
  the presence of both `data-theme="light"` (default = original demo appearance)
  and `data-theme="dark"` token blocks plus the toggle button. Dark was checked
  by token inspection (surface `#1c1c1f` / ink `#ededed`, amber adjusted to
  `#fbbf24` on `#451a03`); light by the same audit. No browser was available in
  this environment, so final visual confirmation is manual.
- Result: **122 passed, 0 failed.**
- New §10 real-click coverage (all node-only): boots the REAL page code on a
  stub DOM with a fake clock, then dispatches `mousedown` + `mouseup` + `click`
  as separate events with a scheduled step re-render (1500 ms → 3700 ms) in
  between, asserting the stale target node still opens the GPT-5.5 panel
  (`aria-expanded="true"` + `Picked for writing and running code` visible),
  that it STAYS open through ticks to settle (`Reasoned for` at 9000 ms), that
  a second click collapses it, and that open/close still works after toggling
  to the dark theme.

## How to test
Open `index.html` in a browser (double-click works, no server needed). Watch one
~13.5 s loop, hover rows, expand a model and the footer buttons, and flip the
sun/moon toggle to compare light and dark.
