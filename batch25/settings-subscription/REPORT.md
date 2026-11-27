# REPORT — billing-period STATE DESYNC fix (settings-subscription)

## Targeted fix (no rebuild)
`./index.html` only. Single state `state.period` (`monthly`|`yearly`) now drives
all three price displays through one discounted unit/total:

- `proUnit = yearly ? Math.round(49*0.8)=39 : 49`
- `proTotal = 6 seats × proUnit` (294 monthly / 234 yearly)

Changed in `updatePeriod()` (in-place `textContent`/`hidden`/attribute writes only):
1. Current-plan card line `#planSub`: was hardcoded `fmtUSD(49) + billed …/yearly`.
   Now `fmtUSD(proUnit) + billed …` → `$49 … monthly` / `$39 … yearly`.
2. Upcoming bill `#billTotal`: was never updated (stuck `$294`).
   Now `fmtUSD(proTotal)` → `$294` / `$234`.
3. Bill detail lines (new ids `#billLineLabel`/`#billLineTotal`, same `<dl>` row):
   `Pro · 6 seats × $49` / `$294` → `× $39` / `$234`. Text-only updates.
4. `Team`/`Business` cards already discounted (`$69→$55`, `$89→$71`) — untouched logic,
   plus tray `#currentPrice` now shares the same `proUnit` variable.
5. Preview toast previously hardcoded `$294`; now computes the synced total.

No other behaviour touched. History invoice rows (`INV-…`, paid totals) left verbatim
— they are past records, not the live period state. History "Upcoming" row left static
per scope (the defect names exactly three synced displays).

## Guardrails kept
- `/*noflash*/` guard untouched (first script in `<head>`, theme pre-paint + inline
  `html{background}` + `meta color-scheme`).
- In-place updates only: `updatePeriod()` writes `textContent`/`hidden`/`aria-pressed`
  on existing nodes. No `innerHTML`/`outerHTML`/`insertAdjacentHTML` anywhere
  (`grep -c innerHTML` = 0). Node identity preserved across full loop (harness asserts).
- Demo data verbatim: `DATA.plan {price:49, seats:6}`, teams 69/89, flows, invoices,
  address — byte-identical, only derived display text changes with period.
- Size 42,468 bytes (<200KB), inline CSS+JS, no deps.

## demo-original.js audit (as instructed)
Inspected `./demo-original.js` before editing. It computes the bill as
`$=j.price*j.seats` (49*6=294, no discount fn applied) and renders the overview line
as `P(j.price)` + `billed yearly/monthly` (price constant, only suffix flips), while
plans/tray use the discount helper `I=(p,t)=>t==='yearly'?Math.round(p*.8):p`.
So the compiled demo chunk itself exhibits this exact desync (constant $49/$294 vs
discounted cards). Per the task's real-browser QA directive ("per the original,
switching period must update the current-plan price line and the upcoming-bill amount
consistently — wire all three displays to the same state"), the fix was applied as
specified; the discrepancy is noted here rather than blocking the fix.

## Proof: hashes differ
- BEFORE: `f4bd927bd4438b80870d7947e1e3400b  ./index.html`
- AFTER:  `2c96fb4fade35366e2c10151a5ef48d0  ./index.html`
- (`./original-backup.html` = byte copy of BEFORE: `f4bd927bd4438b80870d7947e1e3400b`)

## Proof: harness FAILs before, PASSes after
Harness: `./harness.cjs` (node only, no installs; DOM-stub, asserts VISIBLE
`textContent` in light AND dark, monthly→yearly→monthly, node identity, 0 innerHTML).
`node --check ./harness.cjs` OK, `node --check ./main-extracted.js` OK.

BEFORE (`node ./harness.cjs ./original-backup.html`, exit 1):
```
FAIL ./original-backup.html
  - node #billLineLabel must exist (VISIBLE state target)
  - node #billLineTotal must exist (VISIBLE state target)
  - yearly planSub price (dark): expected to contain "$39" got "$49 per member / month, billed yearly"
  - yearly billTotal = 6x$39 (dark): expected "$234" got "$294"
  - yearly billTotal (light): expected "$234" got "$294"
  - yearly planSub (light): expected to contain "$39" got "$49 per member / month, billed yearly"
```

AFTER (`node ./harness.cjs ./index.html`, exit 0):
```
PASS ./index.html (monthly $49/$294 <-> yearly $39/$234, light+dark, identity+no-innerHTML ok)
```

## How to test
1. `node ./harness.cjs ./index.html` → PASS; `node ./harness.cjs ./original-backup.html` → FAIL.
2. Open `./index.html` in a browser: click `Yearly −20%` → plan card `$39 per member /
   month, billed yearly`, tray `$39`, bill `$234` (details `6 seats × $39`); click
   `Monthly` → `$49`/`$294` restored. Toggle sun/moon → same in light and dark.
