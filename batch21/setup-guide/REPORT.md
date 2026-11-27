# fix-setup-guide — targeted fix report

## What was done
Targeted fix of existing `./index.html` (no rebuild). Kept `/*noflash*/` guard, in-place updates, zero `innerHTML` after init, demo data verbatim.

## Root causes / fixes

### 1. Third group title strikethrough — checked against original, kept correct behaviour
`./demo-original.js` strikes a group title only when that group is completed:
`data-done = every task done` on `ui-sgd__group-title` + `::after scaleX(0)` → `scaleX(1)`.
Task labels strike only when `data-state="done"`.

Demo data (verbatim in both files) has `verify / email done:true`, so at init:
`1/6 = 17%`, open = `workspace`, `verify` is `1/1 done` → struck in the original too.
That is why the harness asserts `workspace/billing` unstruck, `verify` struck at init — correct per original.

Replica logic already matched (`groupDone()` → `titleEl data-done`), no unconditional `:last-child` strike rule exists. No JS change was needed; removing the strike would have diverged from the original. Harness proves no stale strike: unchecking `email` removes `data-done` (0%), re-checking restores it, in both themes (`currentColor` works light + dark).

### 2. Title flush / descenders clipped — fixed (real divergence)
Replica diverged from original:
- `.sgd-grouphead`: `gap:10px; padding:11px 10px 11px 12px` vs original `gap:12px; padding:11px 12px`
- `.sgd-grouptitle`: added `white-space:nowrap;overflow:hidden;text-overflow:ellipsis` vs original wrapping only (`overflow-wrap:anywhere`, no overflow/nowrap)

`overflow:hidden` on the title is the clipping risk (descenders) and with asymmetric padding the last header sits tight against the card edge. Fixed to match original:
```css
.sgd-grouphead{...gap:12px;...padding:11px 12px;...}
.sgd-grouptitle{position:relative;min-width:0;text-align:start;overflow-wrap:anywhere;font-size:14px;font-weight:600;line-height:20px;transition:color 300ms ease}
```
Kept original bottom breathing room: card `padding:16px 8px 8px` + `.sgd-tasks li:last-child{padding-bottom:8px}` (both already correct).

### 3. No auto-demo progress in 25s — not a bug, left as is
Original has no `setInterval` auto-advance, only `setTimeout(...,420)` to open the next undone group after you complete a group. Staying at 17% without clicks is expected. Clicking still works. No change per instructions.

## Verification (node only, in-dir)
- `node --check ./harness.js` + extracted inline script `node --check` — both OK
- `node ./harness.js` — ALL CHECKS PASSED, asserts as VISIBLE state:
  - light AND dark: `workspace/billing` no `data-done`, `verify` has `data-done`; strike CSS `scaleX(0)` → `scaleX(1)` via `currentColor`
  - spacing: grouphead `11px 12px` / `gap 12px`, grouptitle no `nowrap`/`overflow:hidden`, card bottom `8px`, last-task `8px`
  - toggle off/on removes/restores strike, progress `17 → 0 → 17 → 100`
  - full-loop node identity preserved, zero `innerHTML` writes after init, `/*noflash*/` + `color-scheme` present, demo data verbatim

## How to test
Open `index.html` in a browser. Header shows `3 groups · 6 tasks · 5 left`, progress 17%. Click current task in each group to complete — groups strike when done, next opens after 420ms. Toggle sun/moon for light/dark; minimise/close/reopen work. Narrow width stacks.

## Light / dark
Checked both: tokens switch via `html[data-theme]`, strike uses `currentColor`, harness re-asserts VISIBLE strike in `light` and `dark`.
