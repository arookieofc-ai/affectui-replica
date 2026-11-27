# Report — Invoice & Credit Note (slug invoice-credit, Billing)

## What was built
- `index.html` (31 KB, self-contained, no external deps): stacked invoice + credit note with segmented Invoice / Credit note tabs, sliding thumb, stacked sheets, invoice sheet (big total, Due + Pay online, From/To, Terms, line table with Metered usage group, Subtotal/Tax/Total), credit sheet (Credit note header with credited amount + Issued badge, Terms with Related invoice button, Lines to credit tray with checkbox + Total + Credit amount inputs, Adjustment total + Applied to invoice note, Issue/Edit credit note flow).
- Demo data used verbatim: seller Lumen Labs, Inc. (48 Harbour Street, Bristol, BS1 4RN, UK), buyer Northwind Logistics GmbH (Speicherstraße 12, Hamburg, 20457, Germany), INV-2041 / CN-0117, 1 Oct 2026 / 31 Oct 2026 / 1 Sep – 30 Sep 2026, lines Growth plan (1 × $1,250.00), Extra seats (12 × $40.00), API calls per 1k (18,420 × $0.42, Metered usage), tax 20%, totals $9,466.40 / $1,893.28 / $11,359.68, adjustment -$11,359.68 (-$11,359.68 USD).
- Interactions: tab switching (click + ArrowLeft/Right/Up/Down/Home/End with roving tabindex), Credit invoice → credit tab with focus, Related invoice → invoice tab, checkbox line selection, amount editing (focus shows raw, input strips non-numeric, Enter commits, Escape cancels, blur clamps 0..line max with round2), Issue → Issued badge + Edit mode + toast + focus move, Edit → back, PDF / Pay online demo toasts, theme toggle.
- Clean-room: own class names (`ic`, `seg`, `sheet`, `crow`, `amt`…), own CSS written from behaviour; no copied bundle source, no `innerHTML`/`outerHTML` anywhere.

## In-place updates
- DOM built once (static HTML + one `bind()` wiring). All ticks/edits use `textContent`, `setAttribute`, `classList`, `disabled`, `style.setProperty` on existing nodes. `paintIssue()` only swaps the single issue button node, never re-renders sections.
- Verified: harness captures 13 nodes across invoice→credit→invoice + toggle + amount + issue + edit full loop and asserts `===` identity; `innerHTML` setter spy = 0 writes after init.

## v5 polish
- All `:hover` inside `@media (hover: hover) and (pointer: fine)`; `html{-webkit-tap-highlight-color:transparent}`; `body{font-variant-numeric:tabular-nums}`; concentric radii (tray 24 / sheet 20 / card 14 / control 10–12); borders on dividers/cells/inputs, layered shadows for elevation; logo gets neutral outline; icon buttons use tighter leading padding (optical alignment).

## Themes
- Tokens via CSS vars; light page #fafaf9 / surface #ffffff / ink #1c1917; dark page #101012 / surface #1c1c1f / ink #ededed. `/*noflash*/` guard + `html{background…}` + `meta color-scheme` first in `<head>`; default follows `prefers-color-scheme`, override stored as `ic-theme`. Toggle top-right with sun/moon + aria-label. Checked light AND dark in harness (attribute switch + token presence) and by inspecting both palettes for contrast (dimmed rows use 0.75 opacity per spec v3 legibility, vs original 0.45).

## What matches / could not verify
- Matches: layout, card/tray nesting, totals math, amount clamp/parse, tab keyboard map, focus-after-issue, responsive collapse (hides Rate/Tax columns and PDF button under 560px, like original container queries).
- Could not verify: pixel-exact colours/animation curves against the live site (no browser in this env — verification was node-only per instructions); `zoom`/`container` scaling wrapper from the demo host was intentionally omitted; PDF export and payment are demo toasts.

## How to test
- Open `index.html` in a browser. Try tabs (mouse + arrow keys), uncheck lines, edit a credit amount (Enter/Escape), Issue then Edit, toggle theme, narrow the window to mobile width.
- Node-only verification (no browser, in-dir only):
  - `node --check harness.js`
  - extract + `node --check` the inline app script, then `node harness.js` (asserts visible painted text, full-loop node identity, zero innerHTML writes, light+dark themes).
- Result: `ALL HARNESS CHECKS PASSED` (67 assertions).
