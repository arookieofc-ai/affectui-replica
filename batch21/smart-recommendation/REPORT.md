# Smart Recommendation — replica report

## What was built
ONE self-contained `index.html` (21.9 KB, no network, no external assets, system fonts) replicating the
`Smart recommendation` suggestion card from `demo-original.js` as clean-room code (own HTML/CSS/JS, same
class hooks `ui-sr` intentionally renamed to `sr-*` with identical layout/behaviour; no verbatim copy).

Page chrome: top bar with `Smart recommendation · 3 options · demo` + visible sun/moon theme toggle
(top-right) switching `data-theme="light"|"dark"` on `<html>`, persisted to `localStorage("sr-theme")`.
`<head>` starts with the `/*noflash*/` guard script, then `html{background}` paint guard, then
`<meta name="color-scheme" content="light dark">`. Default theme is the original demo appearance (light);
stored value or `prefers-color-scheme` overrides it.

## Matched data (verbatim from demo-original.js, nothing invented)
- Title: `Smart recommendation` (default prop).
- Options (id/label/signal/reason, exact strings incl. en-dash and apostrophe):
  1. `incremental` / `Incremental sync` / signal 3 (`Strong signal`) / `Only 4% of rows changed since
     yesterday – switching to [strong]Incremental sync[/strong] saves about 40 minutes.`
  2. `full` / `Full refresh` / signal 1 (`Weak signal`) / `A [strong]Full refresh[/strong] rebuilds every
     table. Safest after schema changes, but takes about 50 minutes.`
  3. `skip` / `Skip tonight` / signal 0 (`No signal`) / `[strong]Skip tonight[/strong] keeps yesterday's
     data. Fine if nobody needs fresh numbers tomorrow morning.`
- Signal labels: `No signal`, `Weak signal`, `Good signal`, `Strong signal`.
- Accept labels via decap (lowercase first letter when `Upper+lower`): `Accept incremental sync`,
  `Accept full refresh`, `Accept skip tonight`.
- Pill `Alternative` shown only when selection ≠ index 0; tag `Recommended` on option 0 in menu;
  trigger `Alternatives`; done status `<Label> accepted` + `Undo`; chevron `m4.5 6.25 3.5 3.5 3.5-3.5`,
  check `m3.5 8.5 3 3 6-7`, spark-card icon paths as in original.
- Behaviour: head toggles open (`aria-expanded`, `data-open`, `inert`); alternatives menu opens above,
  `role=menu`/`menuitemradio`/`aria-checked`, flip to left on overflow, outside `pointerdown` + `Escape`
  closes; selecting sets index, closes menu, re-opens body; Accept sets accepted → done+Undo, hides
  Alternatives; Undo clears. This component has no timers/auto-loop in the original, so none were added.

## v5 polish / hard-won rules applied
- All `:hover` inside `@media (hover:hover) and (pointer:fine)` (harness asserts no un-gated `:hover`).
- `html{-webkit-tap-highlight-color:transparent}`; `body{font-variant-numeric:tabular-nums}`.
- Concentric radii: tray `radius-lg+6`, card `radius-lg`, head/menu `radius-lg−4`, option `radius-sm+1`.
- Shadows for elevation, borders for structure; tokens via CSS vars for every colour, both themes.
- `[hidden]{display:none!important}` present; no broad `.x svg{display:block}` hide-collapser
  (svgs use `svg{display:block}` scoped to their wrappers).
- SVG nodes via `createElementNS` + `setAttribute` only (harness counts 0 `.className` writes on SVG).
- Menu opens on `pointerdown`/`mousedown` capture with click-suppression flag so stub `click()` and real
  pointer+click both work; outside-close on window `pointerdown`/`mousedown` capture + `Escape`;
  hover/focus never re-renders.
- In-place updates only: DOM built once at init with `createElement`; updates mutate
  `textContent`/`hidden`/attributes/`data-*` on existing nodes; zero `innerHTML`/`outerHTML` anywhere
  (static grep + runtime write counter).

## Verification (node only, in-dir files only, no installs, no browser)
- `node --check extracted-check.js` (main script extracted from `index.html`): PASS.
- `node verify.cjs` (in-dir DOM stub, no JSDOM): loads the page script, asserts VISIBLE text only
  (hidden/collapsed/aria-only text excluded), walks the full interaction loop
  (initial → open menu → select Full refresh → Accept → Undo → collapse/expand → Skip → back to
  Incremental → Accept → Undo → Escape/outside-close), asserts node identity (`section/card/head/
  reason/signal/accept` identical objects across the loop) and `innerHTMLWrites===0` after init.
  Result: `ALL CHECKS PASSED (light+dark)` — 50 assertions, dark theme re-checked by flipping
  `data-theme` and re-asserting visible accept/signal text in both themes.
- No agent identities in this component, so no pixel-marks (correctly omitted: exactly-9-cells rule
  applies only when agent identities exist).
- Could not verify: pixel-perfect rendering vs the original site in a real browser (no browser
  available); layout values were matched from the compiled CSS by eye.

## How to test
Open `index.html` in a browser. Toggle the sun/moon button (both themes stay legible). Click the card
header to collapse/expand; open `Alternatives`, pick each option, `Accept`, then `Undo`.
