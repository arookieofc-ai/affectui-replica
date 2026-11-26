# Billing Schedule — replica report

## What was built
`index.html` (self-contained, ~43KB, no network, system fonts) replicates the
`Billing Schedule` phase-builder component from `demo-original.js` as clean-room
vanilla HTML/CSS/JS.

Structure (matches original):
- Title `Create a billing schedule`, card with summary row:
  editable `Build-out phase` input, start `1 Jan 2026`, arrow, end `Milestone`.
- Fields: `Start date` calendar dialog button + `Duration` listbox
  (`Milestone / 1 month / 3 months / 6 months / 12 months`).
- Table `Billing lines` with headers `Name | Repeats | Price`, seed row
  `Set-up fee / Once / $4,999.00 / once / Billed in advance`.
- Actions: `Add product` (upward menu with catalog prices), `Add discount`,
  `Add minimum` (disabled once present).
- Totals `aria-live=polite`: `First invoice $X` + `Phase total ($Y)` with
  `minimum applies` em when floor wins.

Page chrome: top bar `Billing Schedule · Build-out phase · N lines` + sun/moon
toggle. No agent identities in this component, so the 3×3 pixel-mark rule is N/A
(no marks invented).

## Matched data / behaviour (verbatim from demo-original.js)
- Durations, repeats, catalog, defaults:
  `Set-up fee/once/4999, Platform licence/monthly/1200, Premium support/monthly/350,
  Extra seats (10)/monthly/240, Onboarding workshop/once/1500`,
  `defaultStart 2026-01-01`, `phase Build-out phase`, currency `$`.
- Money: `$X,XXX.XX en-US`, `<$0.01` edge, `-` sign handling.
- Dates: `en-GB 1 Jan 2026`, end = start+months−1 day, `Milestone` when months=0.
- Totals: `first = Σ advance × (1−pct)`, `phase = Σ perYear-scaled × (1−pct)` floored
  by `minimum amount`, `minimum applies` flag.
- Repeat labels `Once/Monthly/Quarterly/Yearly`, per-unit `/ once|/ month|/ quarter|/ year`,
  timing `Billed in advance / Billed in arrears`, discount `Whole phase % off`,
  minimum `Per phase minimum`.
- Calendar: Mo–Su, 42 cells, month nav, Arrow/Home/End/PageUp/PageDown keyboard,
  `aria-selected/gridcell/dialog`, focus management, Escape refocus.
- Dropdowns: `aria-expanded/haspopup=listbox`, selected check, Escape closes,
  outside `pointerdown` closes, triggers open on `pointerdown`+`mousedown` capture.
- Number fields: formatted display, raw edit on focus, `[^\d.]` strip, clamp
  (0–100 for %), commit on blur/Enter, live totals.

## In-place updates (spec v4)
- DOM built once in `buildApp()`; rows keyed by id (`rowMap`), calendar 42 buttons
  built once and patched.
- No `innerHTML` writes at runtime (harness traps setter, count stays 0).
- Timers: none that re-render; all updates are event-driven patches
  (`refreshSummary/Totals/Rows/syncMenus` mutate text/attrs only).
- Verified node identity (`title, card, sumEnd, rowsInner` keep `===`) across
  full loop `milestone→1m→3m→6m→12m→milestone + add product + discount`.

## Themes
- Tokens via CSS vars; light = original (`surface #fff, page #fafaf9, ink #171717…`),
  dark (`surface #1c1c1f, page #101012, ink #ededed…`).
- `/*noflash*/` guard first in `<head>` + `html{background}` + `meta color-scheme`,
  key `bs-theme`, falls back to `prefers-color-scheme`, defaults to light (original).
- Toggle top-right updates `data-theme`, persists, swaps icon, `aria-label` flips.
- Checked both: stub sets `data-theme=light|dark`, toggle survives; visual tokens
  reviewed for contrast (no grey-on-grey, borders visible).

## Verification (node only, in-dir)
- `node verify.js` (DOM-stub, no jsdom, no /tmp):
  static (noflash, tokens, hidden rule, pointerdown capture, SVG setAttribute,
  <200KB) + `node --check` on extracted script + stub run asserting VISIBLE text
  (inputs included, hidden excluded) + math (seed 4999, 1200/mo×12=14400,
  arrears first=0, 10%→4499.10, minimum 10000, quarterly 3m=100) + identity +
  zero innerHTML + light/dark.
- Result: all PASS (fail=0).

## How to test
Open `index.html` in a browser. Try: edit phase, pick start date, change duration,
change repeat/timing/price, add all catalog products, add discount/minimum,
remove rows, toggle theme, narrow to <520px, keyboard-only operation.
