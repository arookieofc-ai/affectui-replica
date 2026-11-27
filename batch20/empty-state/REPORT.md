# Empty State replica — targeted fix: schedule row spacing

## What this page is
Standalone replica of the affectUI empty-state demo: `Schedules` card (empty tile + simulated
incoming schedules) and `Run details` panel, with theme toggle, live tick, and in-place updates.

## Root cause (schedule rows glued)
QA: rows painted `Morning briefTomorrow · 09:00`, `Weekly digestMon · 08:30`,
`Nightly checkTonight · 23:00` — name and date glued, in both themes.

Cause in `./index.html`:
- `.sched-main{min-width:0;flex:1}` held two child spans (`.sched-name`, `.sched-sub`).
- `span` children are inline by default; `.sched-main` had no `display` stacking, no `gap`,
  no `margin`, no separator. So the two text nodes flowed inline with zero separation.
- `.sched-row` already had `gap:10px`, but that only separates dot vs main — not name vs date
  inside `main`.

Check against `./demo-original.js`: the original demo only renders the empty states
(`No schedules yet` / `Nothing open`); it contains no schedule rows, no `sched-main`,
no `Morning brief`. So the original does not exhibit this glued layout — nothing to preserve
there. The fix only touches replica-only list CSS.

## Fix (targeted, one rule)
Kept everything else identical. Changed only:

```css
/* before */
.sched-main{min-width:0;flex:1}
/* after */
.sched-main{min-width:0;flex:1;display:flex;flex-direction:column;gap:2px}
```

- Stacks name above date (title/subtitle pattern matching the 13.5px semibold name +
  12px muted sub styles) with a 2px visible gap.
- Theme-independent: no color/token change, no `html[data-theme="dark"]` override touches
  `.sched-main`, so the gap holds in light AND dark.
- Preserved: `/*noflash*/` guard, in-place updates only, zero `innerHTML` writes after init,
  demo data verbatim (`Morning brief`, `Weekly digest`, `Nightly check` + times/tokens/cost).

## Verification (node only, in-dir)
- `node --check ./harness-verify.js` — syntax OK.
- `node ./harness-verify.js` — DOM-stub harness, all PASS:
  - `/*noflash*/` + `color-scheme` present.
  - zero `innerHTML` occurrences (static) and zero runtime `innerHTML` setter calls.
  - demo strings verbatim.
  - VISIBLE spacing: `.sched-main` has `display:flex` + `flex-direction:column` + `gap:2px`;
    asserted for `light` and `dark` via `setTheme()` + 3 `addOne()` rows: each row holds
    2 stacked spans with correct name/date text, so no glued `name+date` line.
  - full-loop node identity: captured `window.__est.nodes()` before/after 6 `tick()`s —
    all refs identical (estMain, schedList, rows, runDetail, etc.).
  - `demo-original.js` confirmed to have no schedule rows (fix does not contradict original).

## What matches / could not verify
- Matches: empty-state look, theme tokens, toggle, schedule simulation, run details,
  live tick text, responsive stacking.
- Could not verify in a real browser (node-only per task); relied on CSS-rule + stub-DOM
  assertions for visible gap in both themes. Open `./index.html` in a browser and click
  `Simulate incoming schedule` 3x in light and dark to confirm name above date with gap.

## How to test
1. `node --check ./harness-verify.js && node ./harness-verify.js`
2. Open `./index.html` in a browser, toggle sun/moon, click `Simulate incoming schedule`.
