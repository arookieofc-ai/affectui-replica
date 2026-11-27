# Fix: floating Ask-input covering chart left edge + caption

## Defect (real-browser QA)
- The floating `Ask about selection…` input at each chart's bottom-left was positioned wrong in both themes.
- It covered the chart's left edge and the caption: `Revenue by region, by plan` painted only as `y plan`, Europe's `$613K` lost its `$` behind the input.
- Good-answer interaction worked — kept working.

## Root cause (checked against ./demo-original.js first)
- Original (`demo-original.js` `W` component): the Ask dialog is conditionally rendered only when a selection is done (`s?.done && S && …ui-rva-ask…`). With no selection there is no input in the DOM, so nothing can cover chart content or captions. When shown, it uses `transform: translate(-50%, calc(-100% - 10px))` (above the selection) with `left: max(150, min(w-150, cx))` / `top: rect.top`.
- Replica (`./index.html`): all three popups (`#askpop-trend`, `#askpop-split`, `#askpop-forecast`) are always in the DOM with `hidden`, toggled via `pop.hidden`. But CSS had `.ask{display:grid;…}` with no `[hidden]` override. Author `display:grid` beats UA `[hidden]{display:none}`, so the popups were always visible even when `hidden=true`.
- With no inline `left/top` set, an absolute popup falls back to its static position: bottom-left of the `.askable`, shifted up by the `-100%-10px` transform — exactly over the caption + bottom-left bars. That is why the split caption (inside `.usage` at the bottom) and Europe's `$613K` were covered. Same in light and dark because the rule is theme-independent.
- Per instructions: original does NOT behave this way (original has no visible input until selection), so this was fixed, not noted as wont-fix.

## Fix (targeted, everything else identical)
- One-line CSS addition after `*{box-sizing:border-box}` in `./index.html`:
  ```css
  [hidden]{display:none!important}
  ```
- No JS/HTML structure changes. No change to popup positioning logic (`left` clamp `150..w-150`, `top: rect.top`, `transform: translate(-50%,calc(-100%-10px))` preserved — same as original, so a shown popup still sits above the selection, clear of the caption below). No change to `/*noflash*/` guard, in-place updates, demo data, or Good-answer handler.
- This restores original semantics: hidden popups compute to `display:none` in both themes; shown popups keep original above-selection placement.

## Verification (node only, in-dir)
- `node --check` on extracted main script: OK. `node --check ./harness-ask-fix.cjs`: OK.
- `node ./harness-ask-fix.cjs` (in-dir DOM stub, no installs):
  - Static: `/*noflash*/`, `meta color-scheme`, `[hidden]{display:none!important}`, `.ask` absolute + above-selection transform, light (`#ffffff/#fafaf9`) and dark (`#1c1c1f/#101012`) tokens, demo verbatim (`Q3 closed at $1.24M`, `Europe still brings in half`, `At this pace Q4…$1.41M`, `Revenue by region, by plan`, `$613K`, `Weekly revenue`), zero `innerHTML` in page script, Good-answer `Thanks` toggle present.
  - Runtime light AND dark: after `reset()` all three `askpop-*` have `hidden==true` → computed `display:none` (no covering); split container visible; caption + `$613K` present; Europe popup math `top=74` (above bars), `left=150` clamped (not at 0); Good-answer `a2` toggles `Good answer→Thanks→Good answer` with live-region update.
  - Full-loop node identity: element objects for `start/turn-*/a*-txt/askpop-*/pick-split/thinking` identical before/after ask cycles + reset in both themes.
  - Zero `innerHTML` writes after init in both themes.
- Result: `ALL HARNESS CHECKS PASSED` in light and dark.

## How to test
- `open index.html` in a browser, toggle sun/moon (top-right) to check light + dark.
- Initial view: no `Ask about selection…` input visible over any chart; `Revenue by region, by plan` fully readable; Europe `$613K` fully readable.
- Click/tap Europe bar (or drag across trend/forecast): popup appears above the selection, input focused, caption still fully visible below. Submit asks a selection question; Good-answer (thumbs-up) toggles tip to `Thanks`.
