# Popover replica — REPORT

## What was built
- Single self-contained `index.html` (21994 bytes, <200KB) with inline CSS + JS, system fonts only, no network.
- Clean-room reimplementation of the `Popover` demo from `demo-original.js` (Weekly digest schedule card + credits info tip).
- Page chrome: minimal header (`Popover / Weekly digest schedule / Small floating card…`) + visible sun/moon theme toggle (top-right).
- Two popovers:
  - Schedule: `side=bottom, align=end, width=280`, title `Schedule`, desc `The digest runs on its own and posts when it's done.`
  - Info tip: `side=top, align=center, width=240`, `aria-label=How credits are counted`, text `A run costs what its model reads and writes. Longer weeks with more pull requests cost a little more.`

## Exact demo data used verbatim (no invented data)
- Card: `Weekly digest`, `Sums up merged pull requests and posts them to #eng-updates`
- Options: `Every day / At 9:00`, `Weekdays / Monday to Friday, 9:00`, `Every Monday / Covers the week before`, radiogroup `How often`, name `pop-demo-plan`
- Foot: `About 40 credits a run`, info `aria-label How credits are counted`
- Trigger label follows saved value (`Every Monday` initial), `aria-haspopup=dialog`, `aria-expanded` synced.
- Behaviours: open by default (`useState(true)`), Save commits draft→saved + closes, Cancel/onClose closes + resets draft→saved, trigger toggles, info toggles, outside `pointerdown`/`mousedown` capture closes (anchor-contained clicks survive), `Escape` closes + restores focus, `focusout` closes when focus leaves anchor, reposition on `resize`/`scroll`, side flip when space is short (`bottom<->top`, `left<->right`, align `start<->end` clamp 8px, `maxHeight`), focus first focusable on open, `role=dialog`, `tabindex=-1`, `data-side`/`data-align`.

## Design tokens / themes
- Light (default, matches original white card): `page #fafaf9, surface #ffffff, ink #1c1917/#171717, muted #78716c, subtle #f5f5f4, border #e7e5e4, radius-lg 16px, radius 10px, radius-sm 6px, shadow 0 1px 2px… + 0 4px 16px…`
- Dark: `surface #1c1c1f, page #101012, ink #ededed, muted #a1a1aa, subtle #26262a, border #2e2e33, shadows darker`.
- Toggle `data-theme=light|dark` on `<html>`, persisted as `affectui-theme`, `/*noflash*/` guard first in `<head>` + `<meta name=color-scheme content="light dark">` + `html{background…}` so dark never flashes white.
- Checked both: stub flips toggle light→dark→light, asserts `data-theme` + persistence + icon `hidden` swap; static tokens verified for contrast (no grey-on-grey).

## Spec compliance notes
- Header pattern / pixel-marks / token counts: N/A — Popover demo has no project, working counts, agents, or token bar, so no invented header or 3×3 marks were added (spec says 9 cells *if* identities exist).
- v5 polish: all `:hover` inside `@media (hover:hover) and (pointer:fine)`, `html{-webkit-tap-highlight-color:transparent}`, `body{font-variant-numeric:tabular-nums}`, concentric `popover 16px = option 10px + 6px`, shadows for elevation (popover `box-shadow` edge, no border) vs borders for structure (card/divider/inputs/selected), optical icon-side `padding 6px 12px 6px 10px`.
- Hard rules: DOM built once (static markup + `init()` wiring), all updates in place (`textContent`, `hidden`, `checked`, `aria-expanded`, `dataset`, `style.top/left/maxHeight`), zero `innerHTML` in main script; open handled via `click` + outside close on `pointerdown`/`mousedown` capture; `[hidden]{display:none!important}`; SVG classes only via `setAttribute`, never `.className`.

## What could not be verified
- Pixel-perfect screenshot vs original (no browser in this env — verified via node only per instructions).
- Real `getBoundingClientRect` flipping in a live viewport (logic mirrors original `_()` flip/clamp; stub uses fixed rects).
- No auto timer loop exists for Popover (interaction-driven); harness advances the full interaction loop instead.

## How to test
- Open `index.html` in a browser. Schedule popover is open by default. Change option → Save updates trigger to `Every day`/`Weekdays`. Cancel/outside-press/Escape closes + resets draft. `i` button toggles the top tip. Resize/scroll repositions/flips. Toggle sun/moon top-right for dark.
- Node verification (in-dir only, no installs):
  - `node --check` on extracted main + noflash scripts → both OK
  - `node ./harness-verify.js` → `ALL_HARNESS_CHECKS_PASSED` (visible text, aria, guards, state transitions, node identity, zero innerHTML, light+dark toggle)
