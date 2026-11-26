# Dropdown Menu — replica report

## What was built
ONE self-contained `index.html` (38.5KB, no network, system fonts) replicating the
affectUI **Dropdown Menu** demo: a `Runs` card with a `Sort:` dropdown trigger and one
`⋯` actions trigger per run. Menus support icons, `⌘` shortcuts, radio checks
(sort + Move-to folders), checkbox (`Notify when done`, keepOpen), danger item
(`Delete run`), dividers, `Sort by` title, glider highlight, submenus, and full
keyboard support (↓/↑ open, arrows move, →/← submenu, Esc/Tab close, Enter/Space
pick, typeahead).

Clean-room implementation: own HTML/CSS/JS written from observed behaviour. No
compiled source copied; icons are own geometric SVGs (classes set only via
`setAttribute`, never `.className`).

## Matched data / behaviour (verbatim from demo-original.js)
- Runs: `Nightly evals` (Today 14:02, 392s → `6m 32s`, $1.84, Evals), `Docs sync`
  (Today 13:50, 125s → `2m 05s`, $0.31, Agents), `Release notes` (Today 11:12,
  708s → `11m 48s`, $3.20, Agents). Meta format `started · Xm XXs · $X.XX`.
- Sorts: `Newest` (default), `Longest`, `Most expensive`, `Name`; title `Sort by`.
- Folders: `Evals`, `Agents`, `Experiments`, `Archive`.
- Row menu: `Rerun ⌘R`, `Duplicate ⌘D`, `Copy link ⌘L`, divider, `Move to ▸`
  (radio per run folder), `Notify when done` (checkbox, keepOpen, default on for
  Nightly evals), divider, `Delete run` (danger).
- Status note (aria-live): default `Open a run’s menu – ⋯ or ↓ on it`;
  `Rerun queued for X`, `X duplicated`, `Link copied`, `X moved to Y`,
  `X would be deleted – kept for the demo`. Notify toggle keeps menu open.
- Menu mechanics: trigger gets `aria-haspopup/expanded`, panel is a floating card
  (`data-side/align`, flip near viewport edge), focus-first/checked/last, glide
  highlight, submenu opens after ~90ms hover / → key, closes after ~220ms,
  typeahead buffer ~700ms, outside `pointerdown` capture closes, hover/focus never
  re-render.

## v5 polish + hard-won rules
- All `:hover` inside `@media (hover:hover) and (pointer:fine)` only.
- `html{-webkit-tap-highlight-color:transparent}`; `body` uses `tabular-nums`.
- Concentric radii: card 16px = row highlight 9px + 5px list padding + 1px border
  (+2px panel pad); pills 999px.
- Shadows for elevation (card, popover), real borders only for dividers/inputs/
  selected states; no ad-hoc hex (all via tokens).
- `[hidden]{display:none !important}` guard; no broad `.x svg` rule (icon SVGs
  sized via `.mi svg`, `.mor svg` only). Open on `pointerdown` capture.
- IN-PLACE ONLY: rows/panels/notes built once at init; all updates mutate
  existing nodes (`textContent`/attrs/`style`); zero `innerHTML` writes ever.

## Verification (node only, no browser)
- `node --check` on extracted page script: PASS.
- In-dir stub harness `harness.cjs`: minimal DOM stub loads the page script,
  seeds skeleton, drives the full loop — open menu → notify keepOpen toggle →
  duplicate → Move-to submenu (advance 200ms timers) → delete → sort change →
  rerun/copy messages → theme toggle. Asserts VISIBLE text only (hidden/aria
  excluded), verbatim strings, state, and node identity.
- Result: HARNESS PASS (55 asserts) — light AND dark checked (toggle to
  `data-theme="dark"`, text persists, dark tokens present), row/note nodes keep
  object identity across the loop, zero `innerHTML` writes after init.

## How to test
Open `index.html` in a browser. Click `Sort:` or any `⋯` (or ↓ on a focused
trigger), navigate with arrows/typeahead, try Move-to submenu, Notify checkbox,
theme toggle (top-right) for light/dark.

## Notes / not verified
- No browser run (per instructions); positioning/animation eyeballed from code.
- Original Hugeicons glyph paths not reproduced (own geometric icons used).
- No agent identities in this component, so no 3×3 pixel-marks (correctly omitted).
- No tick loop in original (event-driven); "full loop" = full interaction cycle.
