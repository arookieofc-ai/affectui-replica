# Model Picker — replica report

## What was built
`index.html` (single self-contained file, ~39KB, no network, system fonts) replicating the
affectUI **Model Picker** (AI chat model menu) inside a chat-composer demo frame
("Ask anything…" + model trigger + send button).

- Trigger: glyph, model name (swap animation), thinking bulb flag, chevron rotate.
- Popover dialog: header `Model` + `Speed/Quality/Cost` columns, 4 options with glyphs,
  names, descriptions, 3x5-segment bars (or `Varies` for Auto), check on selected.
- Settings: `Extended thinking` switch with expanding `Effort` segmented control
  (`Low/Medium/High` + sliding thumb), `Web search` switch.
- Footer: live caption (`~Xs first token · $Y / M tokens`, web-search strings, or
  Auto description), `↑↓ ↵` hints, polite live region.
- Themes: `data-theme="light|dark"` tokens, visible sun/moon toggle top-right,
  default light (original demo appearance), `/*noflash*/` guard + matching inline
  background + `color-scheme` meta.
- Engineering: DOM built once at init; timers update only changed nodes in place
  (no `innerHTML` after init); open/close on `click` toggle (outside `pointerdown` closes);
  hover/focus never rebuilds; `[hidden]{display:none}` rule; SVG classes via
  `setAttribute`.

## Original data / behaviour matched (verbatim from demo-original.js)
- Models: `Opus 5.5`/`Hardest problems` (2/5/5, 2100ms, $25), `Sonnet 5.5`/`Everyday work`
  (4/4/3, 900ms, $15), `Haiku 5.5`/`Quick and light` (5/3/1, 400ms, $4),
  `Auto`/`Picks per message` (sparkle icon, `Varies`).
- Efforts `Low/Medium/High` with multipliers 1.6/2.5/4; thinking multiplies latency.
- Formatters: `X.Xs` / `Nm SSs` / `Hh MMm`, `$` with `<$0.01` edge, easeOutQuart 560ms
  number tween, 5-bar clamp, live caption + aria strings.
- Automation loop timings verbatim: 700 open → 800 hover Opus → 2800 hover Haiku →
  1200 hover Opus → 1300 thinking on → 1400 effort High → 1400 hover Opus →
  1100 pick Opus → 3200 reset to Sonnet loop; any real pointer/key/focus stops it.
- No agent identities in this component, so no pixel-marks (correctly omitted).

## QA fix (2026-11-26 — dead trigger + double check)
- **Dead trigger:** old code toggled on `pointerdown` capture + `mousedown` open + `click`
  with a `suppressClick` flag. For real mouse that is pointerdown→mousedown→click,
  an open menu closed then immediately reopened (or stayed stuck), and every click
  was suppressed so `click` never toggled. After the tour handed over, the first
  user click appeared to close and the next 4 never reopened (aria stayed collapsed).
  Fixed to match original: trigger `click` toggles (`open→close`, `closed→open+focus list`),
  `document pointerdown` only closes when clicking outside. No `suppressClick`, no
  `mousedown` toggle. Now user clicks toggle forever.
- **Tour fighting user:** `stopAuto` now clears the pending `setTimeout`, cancels the
  number-tween `requestAnimationFrame`, and listens to `pointerenter/pointerdown/mousedown/click/keydown/focus/focusin`
  on the demo root (plus `isTrusted` pointer/click on the picker root). Every tour step
  re-checks `stopped` before running, so after takeover the tour never reopens/closes
  or rewrites selection.
- **Double check:** `renderAll` now enforces exactly one `.ui-mdp__check`: it
  `querySelectorAll`s existing checks per title, removes extras, removes all from
  non-selected, adds one to selected if missing. `selIdx` is computed once per render.

## Verification
- `node --check` on extracted script: passed.
- In-dir DOM-stub harness `harness.cjs` (no /tmp, no packages, no browser): loads the page script,
  advances timers through the full 13.9s loop, asserts **VISIBLE PAINTED** text (computed CSS
  visibility, `aria-hidden` still counts as visual, sr-only excluded) and state,
  node identity across the loop, zero `innerHTML` writes after init.
- Extended for this fix (all on painted pixels, not aria-only):
  `assertOneCheck` after every tour stage (init/open/mid/pick/reset = exactly 1),
  `assertMenuOpenPainted` (`aria-expanded=true` + `Hardest problems` paints),
  `assertMenuClosedPainted` (`aria-expanded=false` + option desc does NOT paint + trigger still paints),
  user-takeover sequence: tour-open → real `isTrusted` click closes → `advance(5000)` still closed
  (no fight) → text click reopens → `advance(2500)` still open → chevron click closes →
  open → close, plus manual Haiku pick paints trigger and keeps single check.
- Light AND dark checked (toggle + `data-theme` switch, visibility re-asserted).
- Result: `ALL HARNESS CHECKS PASSED` (run: `node harness.cjs`).

## How to test
Open `index.html` in a browser. Watch one loop, then interact (hover/keyboard:
Arrows/Home/End/Enter/Space/Esc, switches, effort). Toggle ☾/☀ for dark/light.
No build step, no downloads.
