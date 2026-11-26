# Segmented Control — replica report

## What was built
`index.html` (single self-contained file, ~25KB, no network, system fonts) replicating the
`ui-seg` Segmented Control demo as clean-room HTML/CSS/JS.

- 3 control groups built once at init, updated in place afterwards:
  - Dashboard (tray, md): Overview / Analytics / Reports / Notifications (count `3`)
  - Layout (tray, sm, icons): List / Board / Calendar (verbatim SVG paths from demo)
  - Billing (underline, md): Monthly / Yearly (badge `Save 20%`)
- Gliding stretchable pill (tray) / 2px underline (Billing) with direction-aware
  left/right transition timing, press scale `.97` while held/dragged, opacity 0 until measured.
- Draggable: pointerdown selects nearest option (mouse) / tap selects, drag-from-active
  glides (touch); move threshold 3px mouse / 8px touch; `touch-action: pan-y`.
- Keyboard: `ArrowLeft/Up`, `ArrowRight/Down`, `Home`, `End`, roving tabindex,
  `radiogroup`/`radio` roles, `aria-checked`, `aria-labelledby`.
- Overflow: sideways scroll with 24px soft-edge mask (`--fl`/`--fr`), `data-overflow` switches
  touch-action; count formatting via `toLocaleString("en-US")`; dedup by value.
- Autoplay loop verbatim: `["analytics","reports","notifications","overview"]` at
  `1000/2400/3800/5200ms` on the Dashboard control; any `pointerdown`/`keydown`
  capture on the card cancels it (matches `onPointerDownCapture/onKeyDownCapture`).
- Header pattern: `Segmented Control` + `3 groups · 9 options · cycling/paused` +
  theme toggle (top-right). No agent identities in this component, so no pixel-marks
  (spec: only when the component has agent identities).
- Tokens via CSS vars; light default (original demo appearance), dark via
  `html[data-theme]` + sun/moon toggle persisted as `seg-theme`.
- v5 polish: all `:hover` inside `@media (hover:hover) and (pointer:fine)`;
  `html{-webkit-tap-highlight-color:transparent}`;
  `body{font-variant-numeric:tabular-nums}`; concentric radii
  (`border-radius: calc(var(--r) - var(--pad))`); shadows for elevation, borders only
  for structure; `[hidden]{display:none}`; SVG classes only via `setAttribute`;
  no broad `.x svg{display:block}` rule.

## Matched data / behaviour
Options, labels, count `3`, badge `Save 20%`, icon paths, row labels
(Dashboard/Layout/Billing), sizes (md/sm/underline), loop order + timings
`1000+n*1400`, cancel-on-interact — all verbatim from `demo-original.js`.

## Verification (node only, no browser)
- `node --check _main_check.js` (script extracted from `index.html`): **passed**.
- In-dir DOM-stub harness `_harness.cjs`: loads the page script with stub DOM +
  fake timers, advances `1000 → 2400 → 3800 → 5200`, asserts **visible**
  `statusline` text (`Dashboard: Analytics/Reports/Notifications/Overview`),
  9 buttons, per-step **object identity** of all button nodes, and **zero
  `innerHTML` writes** after init: **ALL PASSED**.
- Light AND dark checked: static token audit (light `#ffffff/#fafaf9`,
  dark `#1c1c1f/#101012`, amber dark variant) + in-stub toggle test
  (`data-theme` light→dark→light, `aria-label` updates): **passed**.
- Could not verify: real pixel positions of the gliding pill, pointer-capture
  drag feel, and exact easing curves — no browser available; logic mirrors the
  original (`offsetLeft/offsetWidth`, dir-aware durations).

## How to test
Open `index.html` in a browser. Watch the Dashboard control cycle
Analytics → Reports → Notifications → Overview, then click/drag/arrow-key
any control (cycle pauses). Toggle the sun/moon button top-right for dark mode.
Narrow the window below 560px for the stacked layout.
